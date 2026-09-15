/** Serialize rate updates so an old address response cannot win. */
export function createShippingCoordinator<T>(
  update: (address: T) => Promise<void>
) {
  let currentKey = "";
  let pricedKey = "";
  let pending: { key: string; promise: Promise<boolean> } | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  return {
    invalidate() {
      currentKey = "";
      pricedKey = "";
    },
    isReady(key: string) {
      return !!key && currentKey === key && pricedKey === key;
    },
    isCurrent(key: string) {
      return !!key && currentKey === key;
    },
    update(key: string, address: T): Promise<boolean> {
      currentKey = key;
      if (pending?.key === key) return pending.promise;
      if (!pending && pricedKey === key) return Promise.resolve(true);
      pricedKey = "";
      const promise = queue
        .catch(() => {})
        .then(async () => {
          if (currentKey !== key) return false;
          await update(address);
          if (currentKey !== key) return false;
          pricedKey = key;
          return true;
        });
      pending = { key, promise };
      queue = promise;
      void promise
        .finally(() => {
          if (pending?.promise === promise) pending = undefined;
        })
        .catch(() => {});
      return promise;
    },
  };
}
