// EntryListItem.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { theme } from '../../theme';

export default function EntryListItem({ item, onEdit, onDelete }) {
  return (
    <Card style={styles.card} elevation={4}>
      <Card.Content>
        <Text style={styles.text}>
          {item.date}: {item.body_weight} kg, Cardio: {item.did_cardio ? 'Yes' : 'No'}
        </Text>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon="pencil"
          iconColor={theme.colors.accent}
          size={24}
          onPress={onEdit}
          style={styles.icon}
        />
        <IconButton
          icon="delete"
          iconColor={theme.colors.accent}
          size={24}
          onPress={onDelete}
          style={styles.icon}
        />
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#424242',
  },
  text: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text,
  },
  icon: {
    backgroundColor: '#3C3C3C',
    borderRadius: 20,
  },
});