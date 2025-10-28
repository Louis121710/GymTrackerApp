import React from 'react';
import { Card, Text, IconButton } from 'react-native-paper';
import appStyle from '../../appStyle';

export default function EntryListItem({ item, onEdit }) {
  return (
    <Card style={{ marginBottom: 8, backgroundColor: appStyle.colors.surface, borderRadius: 8, elevation: 2 }}>
      <Card.Content>
        <Text style={{ color: appStyle.colors.text, fontFamily: appStyle.fonts.regular.fontFamily }}>Date: {item.date}</Text>
        <Text style={{ color: appStyle.colors.text, fontFamily: appStyle.fonts.regular.fontFamily }}>Weight: {item.body_weight} kg</Text>
        <Text style={{ color: appStyle.colors.text, fontFamily: appStyle.fonts.regular.fontFamily }}>Cardio: {item.did_cardio ? 'Yes' : 'No'}</Text>
      </Card.Content>
      <Card.Actions>
        <IconButton icon="pencil" color={appStyle.colors.accent} onPress={onEdit} />
      </Card.Actions>
    </Card>
  );
}