import localForage from 'localforage';
/**
 * Manages storage utilities using localforage.
 * Github:
 * https://github.com/localForage/localForage
 *
 * Maintains a local representation of item id and access tokens in the following format:
 * A list of item id and access token pairs.
 *
 * Financial information (transaction history) is stored as follows:
 * [item id, balance, [transaction history], date last accessed]
 */

type ItemAccessPair = { itemId: string; accessToken: string };
type ItemAccessList = Array<ItemAccessPair>;
type FinancialInfoTuple = {
  itemId: string;
  balance: number;
  transactionHistory: Array<object>;
  dateLastAccess: number;
};
type FinancialInfoList = Array<FinancialInfoTuple>;

class StorageUtils {
  itemAccess: ItemAccessList;

  finInfo: FinancialInfoList;

  checkedOut: boolean;

  constructor() {
    // state
    this.itemAccess = [];
    this.finInfo = [];
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
    localForage.setItem('fininfo', this.finInfo);
  }

  /**
   * fetches data from system
   *
   * @param {*} callback is for a loading spinner
   */
  async fetchData() {
    this.checkedOut = true;
    try {
      const data: ItemAccessList | null = await localForage.getItem(
        'itemaccess'
      );
      if (data) {
        this.itemAccess = data;
      }
    } catch (err) {
      console.log(err);
    }
    try {
      const data: FinancialInfoList | null = await localForage.getItem(
        'fininfo'
      );
      if (data) {
        this.finInfo = data;
      }
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * saves data to system and closes editing
   *
   * @param {*} callback is for a loading spinner
   */
  saveAndClose(callback: () => void) {
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

    // save financial information data
    localForage
      .setItem('fininfo', this.finInfo)
      .then((value) => {
        const tmp = this.finInfo;
        this.finInfo = [];
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
  saveData(item: string) {
    if (item === 'itemaccess') {
      localForage.setItem(item, this.itemAccess).catch((error) => {
        throw error;
      });
    } else if (item === 'fininfo') {
      localForage.setItem(item, this.finInfo).catch((error) => {
        throw error;
      });
    } else {
      throw new Error(
        `Invalid argument error: ${item} is not a supported value.`
      );
    }
  }
}

export default StorageUtils;
