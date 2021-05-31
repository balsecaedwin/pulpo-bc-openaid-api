export interface ActivitySummaryInterface {
  /**
   * Transaction date list in ISO format.
   */
  transaction_date_iso_date: string[];

  /**
   * Name of participating organizations.
   */
  participating_org_narrative: string[];

  /**
   * Value of transactions in USD.
   */
  transaction_value_usd: number[];
}
