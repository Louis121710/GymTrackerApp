import React from 'react';
import { Card, Text, IconButton } from 'react-native-paper';
import { theme } from '../../theme';

export default function EntryListItem({ item, onEdit }) {
  return (
    <Card style={{ marginBottom: 8, backgroundColor: theme.colors.surface, borderRadius: theme.roundness, elevation: theme.elevation.level2 }}>
      <Card.Content>
        <Text style={{ color: theme.colors.text, fontFamily: 'Inter-Regular' }}>Date: {item.date}</Text>
        <Text style={{ color: theme.colors.text, fontFamily: 'Inter-Regular' }}>Weight: {item.body_weight} kg</Text>
        <Text style={{ color: theme.colors.text, fontFamily: 'Inter-Regular' }}>Cardio: {item.did_cardio ? 'Yes' : 'No'}</Text>
      </Card.Content>
      <Card.Actions>
        <IconButton icon="pencil" color={theme.colors.accent} onPress={onEdit} />
      </Card.Actions>
    </Card>
  );
}