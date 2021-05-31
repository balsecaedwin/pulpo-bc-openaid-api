/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActivitySummaryInterface } from '@interfaces/activity-summary.interface';
import axios from 'axios';
import { setupCache } from 'axios-cache-adapter';
import * as moment from 'moment';

// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000,
});

// Create `axios` instance passing the newly created `cache.adapter`
const api = axios.create({
  adapter: cache.adapter,
});

const getActivityStartDate = () => {
  const date = moment().subtract(5, 'years').set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  return date.toISOString().substring(0, 19) + 'Z';
};

/**
 * @constant {string}
 * @default
 */
const base_url = 'https://iatidatastore.iatistandard.org/';

/**
 * @constant {string}
 * @default
 */
const def_query = `(recipient_country_code:(SD) OR transaction_recipient_country_code:(SD)) AND (activity_date_start_actual_f:[${getActivityStartDate()} TO *] OR (-activity_date_start_actual_f:[* TO *]
            AND activity_date_start_planned_f:[${getActivityStartDate()} TO *])) AND transaction_type:(3) AND (humanitarian:(1) OR transaction_humanitarian:(1))`;

/**
 * @constant {string}
 * @default
 */
const def_fields = 'transaction_date_iso_date,participating_org_narrative,transaction_value_usd';

/**
 * @constant {string}
 * @default
 */
const def_format = 'json';

/**
 * @constant {number}
 * @default
 */
const def_rows = 50;

/**
 * Function that return a list of transactions.
 * @param {string} [q] - Custom query with core filters.
 * @param {string} [fl] - Fields to retrieve.
 * @param {string} [wt] - Response format. Values: [ json, xml ].
 * @param {number} [rows] - Limit of the retrieved rows.
 * @returns {Promise<TransactionSummaryInterface>} Response of the executed query.
 */
export const searchTransactionsByQuery = async (
  q: string = def_query,
  fl: string = def_fields,
  wt: string = def_format,
  rows: number = def_rows,
): Promise<ActivitySummaryInterface[]> => {
  const path = 'search/activity';

  const res = await api(base_url + path, {
    params: { q, fl, wt, rows },
  });

  let entries = <ActivitySummaryInterface[]>res.data.response.docs;

  entries = entries.reduce((acc: any, cur: any) => {
    cur.transaction_date_iso_date.forEach((transaction_date: any, i: number) => {
      cur.participating_org_narrative.forEach((organization: any) => {
        const temp = (acc[parseInt(transaction_date)] = acc[parseInt(transaction_date)] || {})[
          organization.replace(/\n/, '').trim()
        ];

        (acc[parseInt(transaction_date)] = acc[parseInt(transaction_date)] || {})[
          organization.replace(/\n/, '').trim()
        ] = (temp || 0) + cur.transaction_value_usd[i];
      });
    });
    return acc;
  }, {});

  return entries;
};
