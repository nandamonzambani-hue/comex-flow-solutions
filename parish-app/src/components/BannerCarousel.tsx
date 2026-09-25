import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import type { FlatList as FlatListType, ListRenderItem } from "react-native";
import { FlatList } from "react-native";
import { colors } from "@/theme/colors";
import type { Banner } from "@/types/database";

const AUTO_ADVANCE_MS = 5000;
const SIDE_MARGIN = 16;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const { width } = useWindowDimensions();
  const cardWidth = width - SIDE_MARGIN * 2;
  const listRef = useRef<FlatListType<Banner>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const renderItem: ListRenderItem<Banner> = ({ item }) => (
    <Pressable
      style={[styles.slide, { width: cardWidth }]}
      onPress={() => item.link_url && Linking.openURL(item.link_url)}
      disabled={!item.link_url}
    >
      <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
          setActiveIndex(index);
        }}
        getItemLayout={(_, index) => ({ length: cardWidth, offset: cardWidth * index, index })}
      />
      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((banner, index) => (
            <View key={banner.id} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  slide: { aspectRatio: 16 / 7, borderRadius: 14, overflow: "hidden", backgroundColor: colors.border },
  image: { width: "100%", height: "100%" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 18 },
});
