import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
const PAGE_DURATION = 5000; 
export const StoryView = ({ story, onClose }) => {
  const storyItems = [{ image: story.image, id: story.id }];
  const [currentPage, setCurrentPage] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const pagerRef = useRef(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: PAGE_DURATION,
      useNativeDriver: false
    }).start(({ finished }) => {
      if (finished) handleNext();
    });
    return () => progress.stopAnimation();
  }, [currentPage]);

  const handlePageSelected = (e) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const handleNext = () => {
    if (currentPage < storyItems.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      onClose();
    }
  };


  const width = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      {/* Top Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            { width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, width]
              })
            }
          ]}
        />
      </View>
      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Text style={{ color: 'white', fontSize: 18 }}>✕</Text>
      </Pressable>
      <PagerView
        style={styles.pager}
        initialPage={0}
        scrollEnabled={true}
        ref={pagerRef}
        onPageSelected={handlePageSelected}
      >
        {storyItems.map((item, idx) => (
          <View style={styles.page} key={item.id}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              // resizeMode='contain'
            />
          </View>
        ))}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#444',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#fff',
  },
  closeBtn: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    padding: 8
  },
  pager: { flex: 1 },
  page: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '90%', height: '80%', borderRadius: 15, resizeMode:'contain' },
});