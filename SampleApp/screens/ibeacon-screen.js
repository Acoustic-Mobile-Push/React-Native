/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import React from 'react';
import { Text, ScrollView, NativeModules } from 'react-native';
import { ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';

import { styles, colors } from '../styles';
import { SubscribedComponent } from './subscribed-component';
import { RNAcousticMobilePushLocationEmitter, RNAcousticMobilePushBeaconEmitter } from '../helpers/eventEmitters';
import { Touchable } from '../components/Touchable';
import { ALWAYS, DELAYED, DENIED, DISABLED, ENABLED, RESTRICTED, UNKNOWN } from '../enums/status';
import { DOWNLOADED_LOCATIONS, ENTERED_BEACON, EXITED_BEACON } from '../enums/events';

const { RNAcousticMobilePushBeacon, RNAcousticMobilePushLocation } = NativeModules;

export class iBeaconScreen extends SubscribedComponent {
  static navigationOptions = {
    title: 'Beacons',
    headerRight: () => (
      <Touchable onPress={() => {
        RNAcousticMobilePushLocation.syncLocations();
      }}>
        <Icon name="ios-sync" color="#000" size={24} style={{ paddingRight: 20 }} />
      </Touchable>
    ),
  };

  constructor(props) {
    super(props);
    this.state = {
      status: UNKNOWN,
      statusColor: colors.none,
      statusDetail: {},
      regions: [],
    };
  }

  componentDidMount() {
    this.checkStatus();

    this.subscriptions.push(RNAcousticMobilePushLocationEmitter.addListener(DOWNLOADED_LOCATIONS, () => {
      RNAcousticMobilePushBeacon.beaconRegions().then((regions) => {
        this.setState({ regions });
      });
    }));

    this.subscriptions.push(RNAcousticMobilePushBeaconEmitter.addListener(ENTERED_BEACON, (detail) => {
      const statusDetail = {};
      statusDetail[detail.id] = `Entered Minor${detail.minor}`;
      this.setState({ statusDetail });
    }));

    this.subscriptions.push(RNAcousticMobilePushBeaconEmitter.addListener(EXITED_BEACON, (detail) => {
      const statusDetail = {};
      statusDetail[detail.id] = `Exited Minor${detail.minor}`;
      this.setState({ status: statusDetail });
    }));

    RNAcousticMobilePushBeacon.beaconRegions().then((regions) => {
      this.setState({ regions });
    });
  }

  checkStatus() {
    RNAcousticMobilePushLocation.locationStatus((status) => {
      if (status === DENIED) {
        this.setState({ status: 'Denied', statusColor: colors.error });
      } else if (status === DELAYED) {
        this.setState({ status: 'Delayed (Touch to enable)', statusColor: colors.none });
      } else if (status === ALWAYS) {
        this.setState({ status: 'Enabled', statusColor: colors.success });
      } else if (status === RESTRICTED) {
        this.setState({ status: 'Restricted', statusColor: colors.error });
      } else if (status === ENABLED) {
        this.setState({ status: 'Enabled (When in use)', statusColor: colors.warning });
      } else if (status === DISABLED) {
        this.setState({ status: 'Disabled', statusColor: colors.error });
      }
    });
  }

  render() {
    const { regions, status, statusColor, statusDetail } = this.state;

    return (
      <ScrollView style={styles.scrollView}>
        <Text style={styles.tableHeader}>iBeacon Feature</Text>
        {/* <ListItem title="UUID" style={styles.firstRow} subtitle={RNAcousticMobilePushBeacon.uuid} />
        <ListItem title="Status"
          style={styles.row}
          subtitleStyle={{ color: statusColor }}
          subtitle={status}
        /> */}
        <ListItem style={styles.firstRow}>
                <ListItem.Content>
                  <ListItem.Title>UUID</ListItem.Title>
                  <ListItem.Subtitle>{RNAcousticMobilePushBeacon.uuid}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
        <ListItem style={styles.row}>
                <ListItem.Content>
                  <ListItem.Title>Status</ListItem.Title>
                  <ListItem.Subtitle style={{ color: statusColor }}>{status}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>

        <Text style={styles.tableHeader}>iBeacon Major Regions</Text>
        {regions.map((region) => {
          if (statusDetail[region.id]) {
            return (
              // <ListItem key={region.id} title={`${region.major}`} rightTitle={statusDetail[region.id]} />
              <ListItem key={region.id}>
                <ListItem.Content>
                  <ListItem.Title>{`${region.major}`}</ListItem.Title>
                  <ListItem.Subtitle>{statusDetail[region.id]}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
            );
          }
          return (
            // <ListItem key={region.id} title={`${region.major}`} />
            <ListItem key={region.id}>
              <ListItem.Content>
                <ListItem.Title>{`${region.major}`}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          );
        })}
      </ScrollView>
    );
  }
}
