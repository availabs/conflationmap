export default class GeoCalculator {
  constructor(config) {
    this.measure = config.measure;
    this.geoLevel = config.geoLevel;
    this.geoId = config.geoId;
    this.geoStates = config.geoStates;
    this.geoAttributes = config.geoAttributes;
    this.data = config.data;
  }
}
