import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { REACT_APP_API_URI as API_URI } from "@env";

import { setCurrentBookmarkId } from "../../redux/currentBookmarkIdSlice";
import transformTimeStamp from "../../utils/formatTimeStamp";
import styles from "./styles";

import SearchBox from "../../components/SearchBox.js/SearchBox";
import SortController from "../../components/SortController/SortController";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import HighlightedContent from "../../components/HighlightedContent/HighlightedContent";

export default function Bookmark() {
  const { navigate } = useNavigation();

  const dispatch = useDispatch();
  const currentUserId = useSelector(
    (state) => state.currentUserId.currentUserId,
  );

  const scrollViewRef = useRef();

  const [refresh, setRefresh] = useState(false);
  const [bookmarkList, setBookmarkList] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredBookmarkList, setFilteredBookmarkList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("MY");
  const [sortOrder, setSortOrder] = useState("최신순");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bookmarkIdToDelete, setBookmarkIdToDelete] = useState(null);

  useEffect(() => {
    getAllMyBookmarks();
  }, [activeTab]);

  useEffect(() => {
    getAllMyBookmarks();
  }, [refresh]);

  useEffect(() => {
    if (searchKeyword) {
      handleSearch();
    } else {
      setIsSearching(false);
    }
  }, [searchKeyword]);

  useFocusEffect(
    useCallback(() => {
      setRefresh((prevRefresh) => !prevRefresh);
    }, []),
  );

  const getAllMyBookmarks = async () => {
    try {
      const url = `${API_URI}/api/bookmarks/creator?creatorId=${currentUserId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const bookmarkList = await response.json();
      setBookmarkList(bookmarkList.reverse());
    } catch (error) {
      console.warn(error);
    }
  };

  const handleSearch = () => {
    const filteredBookmarkList = bookmarkList.filter(
      (bookmark) =>
        bookmark.hashtags.includes(searchKeyword) ||
        bookmark.content.includes(searchKeyword),
    );
    setFilteredBookmarkList(filteredBookmarkList);
    setIsSearching(true);
    scrollToTop();
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    scrollToTop();
  };

  const handleSortToggle = () => {
    setBookmarkList(bookmarkList.reverse());
    setFilteredBookmarkList(filteredBookmarkList.reverse());
    setSortOrder(sortOrder === "최신순" ? "오래된순" : "최신순");
    scrollToTop();
  };

  const handleBookmarkCardPress = (bookmarkId) => {
    dispatch(setCurrentBookmarkId(bookmarkId));
    navigate("BookmarkDetail");
  };

  const handleDeleteButtonPress = (bookmarkId) => {
    setBookmarkIdToDelete(bookmarkId);
    setIsModalVisible(true);
  };

  const handleDeleteBookmark = async () => {
    try {
      const response = await fetch(
        `${API_URI}/api/bookmarks/${bookmarkIdToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 204) {
        setIsModalVisible(false);
        getAllMyBookmarks();
      }
    } catch (error) {
      console.error("책갈피 삭제에 실패하였습니다: ", error);
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
  };

  return (
    <View style={styles.container}>
      {isModalVisible && (
        <ConfirmModal
          isModalVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          handleDeleteBookmark={() => handleDeleteBookmark()}
        />
      )}
      <SearchBox
        setSearchKeyword={setSearchKeyword}
        placeholder="찾는 책갈피가 있으신가요?"
      />
      <View style={styles.controllerContainer}>
        <View style={styles.selectionContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "MY" && styles.activeTab]}
            onPress={() => handleTabSwitch("MY")}
          >
            <Text style={styles.tabText}>MY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pinned" && styles.activeTab]}
            onPress={() => handleTabSwitch("pinned")}
          >
            <Image
              source={
                activeTab === "pinned"
                  ? require("../../assets/images/button-uncollect.png")
                  : require("../../assets/images/button-collect.png")
              }
              style={styles.pinButton}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <SortController
          sortOrder={sortOrder}
          handleSortToggle={handleSortToggle}
        />
      </View>
      <View style={styles.cardContainer}>
        <ScrollView ref={scrollViewRef}>
          {(isSearching ? filteredBookmarkList : bookmarkList).map(
            (bookmark, index) => (
              <View key={index} style={styles.card}>
                <TouchableOpacity
                  onPress={() => handleBookmarkCardPress(bookmark._id)}
                >
                  <Text style={styles.dateString}>
                    {transformTimeStamp(new Date(bookmark.createdAt))}
                  </Text>
                  {isSearching ? (
                    <HighlightedContent
                      text={bookmark.content}
                      keyword={searchKeyword}
                    />
                  ) : (
                    <Text style={styles.content} numberOfLines={5}>
                      {bookmark.content}
                    </Text>
                  )}
                  <View style={styles.cardBottomConntainer}>
                    <View style={styles.hashtagContainer}>
                      {bookmark.hashtags?.map((tag, index) => (
                        <Text
                          style={
                            tag !== searchKeyword
                              ? styles.hashtag
                              : styles.highlightedHashtag
                          }
                          key={index}
                        >
                          #{tag}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.deleteButtonContainer}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteButtonPress(bookmark._id)}
                      >
                        <Text style={styles.deleteText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ),
          )}
        </ScrollView>
      </View>
    </View>
  );
}
