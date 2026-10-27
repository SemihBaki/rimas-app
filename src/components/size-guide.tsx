import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/data/catalog';
import { sizeGuideFor } from '@/data/catalog';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Layout } from '@/constants/theme';

import { Body, BodyStrong, Display, Label, Small } from './typography';

type SizeGuideSheetProps = {
  visible: boolean;
  product: Product;
  selectedSize?: string | null;
  onClose: () => void;
  /** When provided, tapping a row picks that size and closes the sheet. */
  onSelect?: (size: string) => void;
};

/**
 * Body-measurement table for the product's size family.
 * Shown as a bottom sheet so the product page keeps its context.
 */
export function SizeGuideSheet({
  visible,
  product,
  selectedSize,
  onClose,
  onSelect,
}: SizeGuideSheetProps) {
  const insets = useSafeAreaInsets();
  const guide = sizeGuideFor(product);

  if (!guide) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Beden tablosunu kapat"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <View style={styles.headerRow}>
              <Label tone="muted">Beden Tablosu</Label>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kapat"
                hitSlop={12}
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.5 : 1 }]}>
                <Ionicons name="close" size={18} color={Colors.ink} />
              </Pressable>
            </View>

            <Display level="m" style={{ marginTop: 6 }}>
              {guide.title}
            </Display>
            <Small style={{ marginTop: 6 }}>{product.fit}</Small>

            <View style={styles.table}>
              <View style={[styles.row, styles.headRow]}>
                <Label style={[styles.cell, styles.sizeCell, styles.headCell]}>Beden</Label>
                {guide.columns.map((column) => (
                  <Label key={column} style={[styles.cell, styles.headCell]}>
                    {column}
                  </Label>
                ))}
              </View>

              {guide.rows.map((row) => {
                const selected = row.size === selectedSize;
                const content = (
                  <>
                    <BodyStrong
                      style={[
                        styles.cell,
                        styles.sizeCell,
                        { letterSpacing: 0.8 },
                        selected ? { color: Colors.ink } : null,
                      ]}>
                      {row.size}
                    </BodyStrong>
                    {row.values.map((value, index) => (
                      <Body
                        key={guide.columns[index]}
                        style={[
                          styles.cell,
                          styles.valueCell,
                          selected ? { color: Colors.ink } : null,
                        ]}>
                        {value}
                      </Body>
                    ))}
                  </>
                );

                return onSelect ? (
                  <Pressable
                    key={row.size}
                    accessibilityRole="button"
                    accessibilityLabel={`${row.size} beden seç`}
                    onPress={() => onSelect(row.size)}
                    style={({ pressed }) => [
                      styles.row,
                      selected ? styles.rowSelected : null,
                      { opacity: pressed ? 0.6 : 1 },
                    ]}>
                    {content}
                  </Pressable>
                ) : (
                  <View key={row.size} style={[styles.row, selected ? styles.rowSelected : null]}>
                    {content}
                  </View>
                );
              })}
            </View>

            <Small style={{ marginTop: 14 }}>{guide.note}</Small>

            <View style={{ marginTop: 22 }}>
              <Label>Nasıl ölçülür</Label>
              {guide.tips.map((tip) => (
                <View key={tip.title} style={styles.tip}>
                  <BodyStrong style={{ minWidth: 74, fontSize: 13 }}>{tip.title}</BodyStrong>
                  <Small style={{ flex: 1, lineHeight: 17 }}>{tip.copy}</Small>
                </View>
              ))}
            </View>

            {onSelect ? (
              <Small style={{ marginTop: 18, fontSize: 10.5 }}>
                Bedeni seçmek için tablodaki satıra dokunun.
              </Small>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: Colors.overlay,
  },
  sheet: {
    width: '100%',
    maxWidth: Layout.maxWidth,
    maxHeight: '88%',
    backgroundColor: Colors.paper,
  },
  sheetContent: {
    paddingHorizontal: Layout.gutter,
    paddingTop: 18,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -6,
  },
  table: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    paddingHorizontal: 6,
  },
  rowSelected: {
    backgroundColor: Colors.paperDeep,
  },
  headRow: {
    borderBottomColor: Colors.lineStrong,
  },
  cell: {
    flex: 1,
    textAlign: 'right',
  },
  sizeCell: {
    flex: 1.1,
    textAlign: 'left',
  },
  headCell: {
    fontSize: 8.5,
    letterSpacing: 1.5,
  },
  valueCell: {
    fontVariant: ['tabular-nums'],
    fontSize: 13,
  },
  tip: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    alignItems: 'flex-start',
  },
});
