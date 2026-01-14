import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from './DailyQuoteCard.styles';

/**
 * Daily motivation quote card component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.quote - Quote object with quote and author
 */
const DailyQuoteCard = ({ quote }) => {
  if (!quote) return null;

  return (
    <View style={styles.quoteCard}>
      <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FFD700" />
      <View style={styles.quoteContent}>
        <Text style={styles.quoteText}>"{quote.quote}"</Text>
        <Text style={styles.quoteAuthor}>- {quote.author}</Text>
      </View>
    </View>
  );
};

export default DailyQuoteCard;
