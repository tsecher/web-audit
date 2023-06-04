export abstract class AbstractEventsClass {

  protected callbacks: any = {};

  /**
   * Listen events.
   *
   * @param {string} id
   * @param callback
   */
  on(id: string, callback: any) {
    this.callbacks[id] = this.callbacks[id] || [];
    this.callbacks[id].push(callback);
  }

  /**
   * Trigger events.
   *
   * @param {string} id
   * @param {{}} data
   * @returns {Promise<void>}
   */
  async trigger(id: string, data: any = {}) {
    console.log(`Trigger: ${id} url:${data?.url?.url?.toString()}  step: ${data.name} [${data.step}]`);
    for (const cb of this.callbacks[id] || []) {
      await cb(data);
    }
  }
}
