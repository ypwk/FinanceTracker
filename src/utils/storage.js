import localForage from 'localforage';
/**
 * Manages storage utilities using localforage.
 * Github:
 * https://github.com/localForage/localForage
 *
 * Maintains a local representation of item id and access tokens in the following format:
 * A list of item id and access token pairs.
 */

class StorageUtils {
  constructor() {
    // state
    this.itemAccess = [];
    this.checkedOut = false;
    // initialize localForage
    localForage.config({
      // configure localForage
      driver: localForage.WEBSQL, // Force WebSQL; same as using setDriver()
      name: 'YPWKFinanceTracker',
      version: 1.0,
      size: 4980736, // Size of database, in bytes. WebSQL-only for now.
      storeName: 'keyvaluepairs', // Should be alphanumeric, with underscores.
      description: 'Storage for Finance Tracker',
    });
    // check if this is the first time starting up.
    localForage
      .getItem('firsttimeflag')
      .then((value) => {
        if (value === null) {
          this.init();
        }
        return value;
      })
      .catch((error) => {});
  }

  /**
   * Initializes items on first startup
   */
  init() {
    console.log('First startup, initializing storage components.');
    localForage.setItem('firsttimeflag', true);
    localForage.setItem('itemaccess', this.itemAccess);
  }

  /**
   * fetches data from system
   *
   * @param {*} callback is for a loading spinner
   */
  async fetchData() {
    try {
      const data = await localForage.getItem('itemaccess');
      this.itemAccess = data;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * saves data to system and closes editing
   *
   * @param {*} callback is for a loading spinner
   */
  saveAndClose(callback) {
    if (this.checkedOut === false) {
      console.log(
        'storageUtils: trying to save data that has not been fetched.'
      );
    }

    // save item access data
    localForage
      .setItem('itemaccess', this.itemAccess)
      .then((value) => {
        const tmp = this.itemAccess;
        this.itemAccess = [];
        return tmp;
      })
      .catch((error) => {
        throw error;
      });

    this.checkedOut = false;
    callback();
  }

  /**
   * Saves data to system
   */
  saveData() {
    localForage.setItem('itemaccess', this.itemAccess).catch((error) => {
      throw error;
    });
  }
}

export default StorageUtils;
