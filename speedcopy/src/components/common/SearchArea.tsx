import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SearchBar } from './SearchBar';
import { FilterButton } from './FilterButton';

interface SearchAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export const SearchArea: React.FC<SearchAreaProps> = ({
  value,
  onChangeText,
  onFilterPress,
  placeholder = 'Search',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <SearchBar
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
        />
      </View>
      <FilterButton onPress={onFilterPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
  },
});
