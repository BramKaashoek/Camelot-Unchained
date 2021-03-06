/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';

import { ContextMenuContentProps, RaisedButton, events, ql } from 'camelot-unchained';

import { StyleDeclaration } from 'aphrodite';
import eventNames from '../../../lib/eventNames';
import { prettifyText } from '../../../lib/utils';
import { InventoryItemFragment } from '../../../../../gqlInterfaces';

export interface ContextMenuContentStyle extends StyleDeclaration {
  contextMenuButton: React.CSSProperties;
}

export const defaultContextMenuContentStyle: ContextMenuContentStyle = {
  contextMenuButton: {
    borderBottom: '1px solid #222',
    maxWidth: '300px',
  },
};

export interface ContextMenuContentCompProps {
  styles?: Partial<ContextMenuContentStyle>;
  item: InventoryItemFragment;
  contextMenuProps: ContextMenuContentProps;
}

class ContextMenuContent extends React.Component<ContextMenuContentCompProps, {}> {
  public render() {
    const { contextMenuButton } = defaultContextMenuContentStyle;
    return (
      <div>
        {this.renderGearSlotButtons()}
        <RaisedButton styles={{ button: contextMenuButton }} onClick={this.onDropItem}>
          Drop item
        </RaisedButton>
      </div>
    );
  }

  private renderGearSlotButtons = () => {
    const item = this.props.item;
    const gearSlotSets = item && item.staticDefinition && item.staticDefinition.gearSlotSets;
    const { contextMenuButton } = defaultContextMenuContentStyle;
    return gearSlotSets && gearSlotSets.map((gearSlotSet, i) => {
      return (
        <RaisedButton
          key={i}
          styles={{ button: contextMenuButton }}
          onClick={() => this.onEquipItem(gearSlotSet.gearSlots)}
          onMouseOver={() => this.onHighlightSlots(gearSlotSet.gearSlots)}
          onMouseLeave={this.onDehighlightSlots}>
          Equip to&nbsp;
          {gearSlotSet.gearSlots.map((gearSlot, i) => {
            if (i !== gearSlotSet.gearSlots.length - 1) {
              return prettifyText(gearSlot.id) + ', ';
            } else {
              return prettifyText(gearSlot.id);
            }
          })}
        </RaisedButton>
      );
    });
  }

  private onEquipItem = (gearSlots: Partial<ql.schema.GearSlotDefRef>[]) => {
    const { item, contextMenuProps } = this.props;
    const payload: any = {
      inventoryItem: item,
      willEquipTo: gearSlots,
    };
    events.fire(eventNames.onEquipItem, payload);
    events.fire(eventNames.onDehighlightSlots);
    contextMenuProps.close();
  }

  private onDropItem = () => {
    const { item, contextMenuProps } = this.props;
    const payload = {
      inventoryItem: item,
    };
    events.fire(eventNames.updateInventoryItems, payload);
    events.fire(eventNames.onDropItem, payload);
    contextMenuProps.close();
  }

  private onHighlightSlots = (gearSlots: Partial<ql.schema.GearSlotDefRef>[]) => {
    events.fire(eventNames.onHighlightSlots, gearSlots);
  }

  private onDehighlightSlots = () => {
    events.fire(eventNames.onDehighlightSlots);
  }
}

export default ContextMenuContent;
