/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

'use strict';
import React from 'react';
import {Text, ScrollView, TouchableNativeFeedback, TouchableOpacity, Platform} from 'react-native';
import {ListItem} from 'react-native-elements'
import {styles} from '../styles'
import {SubscribedComponent} from './subscribed-component';
import {RNAcousticMobilePushBeacon, RNAcousticMobilePushLocation} from 'NativeModules';
import {RNAcousticMobilePushLocationEmitter, RNAcousticMobilePushBeaconEmitter} from './home-screen';
const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
import Icon from 'react-native-vector-icons/Ionicons';

export class iBeaconScreen extends SubscribedComponent {
	static navigationOptions = ({ navigation }) => {
		return {
			title: "Beacons",
			headerRight: (
				<Touchable onPress={ () => { RNAcousticMobilePushLocation.syncLocations(); } }>
					<Icon name="ios-sync" color="#000" size={24} style={{paddingRight: 20}} />
				</Touchable>
			),
		};
	};		

    constructor(props) {
        super(props);
		this.state = {regions: [], status: {}};
	}

	componentWillMount() {
		super.componentWillMount();

		this.subscriptions.push( RNAcousticMobilePushLocationEmitter.addListener('DownloadedLocations', (error, events) => {
			RNAcousticMobilePushBeacon.beaconRegions().then((regions) => { 
			this.setState({regions: regions});
			});
		}));

		this.subscriptions.push( RNAcousticMobilePushBeaconEmitter.addListener('EnteredBeacon', (detail) => {
			var status = {}
			status[detail.id] = 'Entered Minor' + detail.minor;
			this.setState({status: status});
		}));

		this.subscriptions.push( RNAcousticMobilePushBeaconEmitter.addListener('ExitedBeacon', (detail) => {
			var status = {}
			status[detail.id] = 'Exited Minor' + detail.minor;
			this.setState({status: status});
		}));

		RNAcousticMobilePushBeacon.beaconRegions().then((regions) => { 
			this.setState({regions: regions});
		});
	}

	render() {
		return (
			<ScrollView style={styles.scrollView}>
				<Text style={styles.tableHeader}>iBeacon Feature</Text>
				<ListItem title="UUID" style={styles.firstRow} subtitle={RNAcousticMobilePushBeacon.uuid} />
				<ListItem title="Status" style={styles.row} subtitleStyle={{color: RNAcousticMobilePushBeacon.beaconEnabled ? "green" : "red"}} subtitle={RNAcousticMobilePushBeacon.beaconEnabled ? "Enabled" : "Disabled"} />

				<Text style={styles.tableHeader}>iBeacon Major Regions</Text>
					{ this.state.regions.map((region) => {
						if(this.state.status[region.id]) {
							return (
								<ListItem key={region.id} title={region.major + ""} rightTitle={this.state.status[region.id]} />
							);
						} else {
							return (
								<ListItem key={region.id} title={region.major + ""} />
							);
						}
					}) }
			</ScrollView>
		);
	}
}