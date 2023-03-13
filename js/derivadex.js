'use strict';

//  ---------------------------------------------------------------------------

const crypto = require ('crypto');
const secp256k1 = require ('secp256k1');
const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { BadSymbol, BadRequest, ArgumentsRequired } = require ('./base/errors');
// const { AuthenticationError, BadRequest, DDoSProtection, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied, ArgumentsRequired, BadSymbol } = require ('./base/errors');
// const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class derivadex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'derivadex',
            'name': 'DerivaDEX',
            'countries': [ 'SG' ], // Singapore
            'version': 'v1',
            'rateLimit': 200, // TODO: add documentation for tiered rate limiting
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': {
                    'public': 'https://beta.derivadex.io',
                    'private': 'https://beta.derivadex.io',
                    'stats': 'https://beta.derivadex.io/stats',
                    // 'v2': 'https://beta.derivadex.io/v2',
                    'v2': 'http://op1.ddx.one:15080/v2', // TODO: DELETE THIS
                    'op1': 'http://op1.ddx.one:15080/stats', // TODO: delete this before submitting
                },
                'logo': 'https://gitlab.com/dexlabs/assets/-/raw/main/light-round.png',
                'api': {
                    'public': 'https://exchange.derivadex.com',
                    'private': 'https://exchange.derivadex.com',
                    'stats': 'https://exchange.derivadex.com/stats',
                    'v2': 'https://exchange.derivadex.com/v2',
                },
                'www': 'https://exchange.derivadex.com',
                'doc': [
                    'https://docs.derivadex.io',
                    'http://api.derivadex.io/',
                    'https://exchange.derivadex.com/api-docs',
                ],
                'fees': 'https://docs.derivadex.io/trading/fees',
            },
            'api': {
                'public': {
                    'get': {
                        // TODO: FIX THE API COSTS
                        'account/{trader}/strategy/{strategyId}/adls': 1,
                        'account/{trader}/strategy/{strategyId}/fills': 1,
                        'account/{trader}/strategy/{strategyId}/': 1,
                        'account/{trader}/strategy/{strategyId}/liquidations': 1,
                        'account/{trader}/strategy/{strategyId}/order_book': 1,
                        'account/{trader}/strategy/{strategyId}/order_intents': 1,
                        'account/{trader}/strategy/{strategyId}/positions': 1,
                        'account/{trader}/strategy/{strategyId}/strategy_updates': 1,
                        'account/{trader}': 1,
                        'account/{trader}/trader_updates': 1,
                        'adl': 1,
                        'ddx_fee_pool': 1,
                        'epochs': 1,
                        'fills': 1,
                        'insurance_fund': 1,
                        'liquidations': 1,
                        'order_book': 1,
                        'order_intents': 1,
                        'positions': 1,
                        'prices': 1,
                        'specs': 1,
                        'strategies': 1,
                        'startegy_updates': 1,
                        'trader_updates': 1,
                        'traders': 1,
                        'tx_logs': 1,
                        'aggregations/collateral': 1,
                        'aggregations/volume': 1,
                        'markets/markets': 1,
                        'markets/order_book/L2/{symbol}': 1,
                        'markets/tickers': 1,
                        'snapshot/addresses': 1,
                    },
                },
                'v2': {
                    'get': {
                        'rest/ohlcv': 1,
                        'encryption-key': 1,
                        'request': 1,
                    },
                },
                'private': {
                    'get': {
                        'apiKey': 5,
                    },
                    'post': {
                        'apiKey': 5,
                    },
                },
            },
            // TODO: FILL OUT EXCEPTIONS
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'requiredCredentials': {
                'walletAddress': true,
                'privateKey': true,
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'swap',
                'defaultNetwork': 'ERC20',
                'networks': {
                    'ETH': 'ERC20',
                },
                'networksById': {
                    'ETH': 'ERC20',
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.0,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name derivadex#fetchMarkets
         * @description retrieves data on all markets for derivadex
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        params['kind'] = 0;
        const response = await this.publicGetSpecs (params);
        // {
        //     "value": [
        //         {
        //             "kind": 0,
        //             "name": "DDXPERP",
        //             "expr": "\n(Market :name "DDXPERP"\n :tick-size 0.1\n :max-order-notional 0\n :max-taker-price-deviation 0.02\n :min-order-size 0.0001\n)",
        //             "value": {
        //                 "tickSize": "0.1",
        //                 "minOrderSize": "0.0001",
        //                 "maxOrderNotional": "0",
        //                 "maxTakerPriceDeviation": "0.02"
        //             }
        //         },
        //         {
        //             "kind": 0,
        //             "name": "BTCPERP",
        //             "expr": "\n(Market :name "BTCPERP"\n :tick-size 1\n :max-order-notional 1000000\n :max-taker-price-deviation 0.02\n :min-order-size 0.00001\n)",
        //             "value": {
        //                 "tickSize": "1",
        //                 "minOrderSize": "0.00001",
        //                 "maxOrderNotional": "1000000",
        //                 "maxTakerPriceDeviation": "0.02"
        //             }
        //         },
        //         {
        //             "kind": 0,
        //             "name": "ETHPERP",
        //             "expr": "\n(Market :name "ETHPERP"\n :tick-size 0.1\n :max-order-notional 1000000\n :max-taker-price-deviation 0.02\n :min-order-size 0.0001\n)",
        //             "value": {
        //                 "tickSize": "0.1",
        //                 "minOrderSize": "0.0001",
        //                 "maxOrderNotional": "1000000",
        //                 "maxTakerPriceDeviation": "0.02"
        //             }
        //         }
        //     ],
        //         "timestamp": 1674260369,
        //         "success": true
        // }
        const markets = response['value'];
        return markets.filter ((market) => market['name'] !== 'DDXPERP').map ((market) => {
            const name = market['name'];
            const base = name.slice (0, -4);
            return {
                'id': name,
                'symbol': name,
                'base': base,
                'quote': 'USD',
                'settle': 'USDC',
                'baseId': base.toLowerCase (),
                'quoteId': 'usd',
                'settleId': 'usdc',
                'type': 'swap',
                'spot': 'false',
                'margin': 'false',
                'swap': 'true',
                'future': 'false',
                'option': 'swap',
                'active': 'true',
                'contract': 'true',
                'linear': 'true',
                'inverse': 'false',
                'taker': '0.002',
                'maker': '0.000',
                'precision': {
                    'amount': 6,
                    'price': 6,
                    'quote': 6,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': 3,
                    },
                    'amount': {
                        'min': market['value']['minOrderSize'],
                        'max': undefined,
                    },
                    'price': {
                        'min': market['value']['tickSize'],
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': market['value']['maxOrderNotional'],
                    },
                },
                'info': market,
            };
        });
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name derivadex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const networks = {};
        networks['ERC20'] = {
            'info': undefined,
            'id': 'ETH',
            'network': this.networkIdToCode ('ETH'),
            'active': true,
            'deposit': true,
            'withdraw': true,
            'fee': undefined,
        };
        return [
            {
                'id': 'usdc',
                'code': 'USDC',
                'name': 'USDC',
                'active': true,
                'fee': 0,
                'precision': 2, // TODO: revisit this precision value
                'deposit': true,
                'withdraw': true,
                'limits': {
                    'deposit': {
                        'min': 1000,
                        'max': 1000000,
                    },
                },
                'networks': networks,
                'info': undefined,
            },
            {
                'id': 'ddx',
                'code': 'DDX',
                'name': 'DDX',
                'active': false,
                'fee': 0,
                'precision': 2, // TODO: revisit this precision value
                'deposit': true,
                'withdraw': true,
                'limits': {
                    'deposit': {
                        'min': 0.000001,
                        'max': undefined,
                    },
                },
                'networks': networks,
                'info': undefined,
            },
        ];
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name derivadex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers ([ market['symbol'] ], params);
        const ticker = this.safeValue (tickers, market['symbol']);
        if (ticker === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() symbol ' + symbol + ' not found');
        }
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const result = {};
        for (let i = 0; i < symbols.length; i++) {
            const ticker = await this.constructTicker (symbols[i]);
            if (ticker !== undefined) {
                result[symbols[i]] = ticker;
            }
        }
        return result;
    }

    async constructTicker (symbol) {
        const params = {};
        params['symbol'] = symbol;
        params['depth'] = 1;
        const request = {
            'symbol': symbol,
        };
        const [ orderBookResponse, tickerResponse ] = await Promise.all ([
            this.publicGetMarketsOrderBookL2Symbol (this.extend (request, params)),
            this.publicGetMarketsTickers ({ 'symbol': symbol }),
        ]);
        const orderBookValue = orderBookResponse['value'];
        const bid = this.safeString (orderBookValue[0], 'price');
        const bidVolume = this.safeString (orderBookValue[0], 'amount');
        const ask = this.safeString (orderBookValue[1], 'price');
        const askVolume = this.safeString (orderBookValue[1], 'amount');
        const ticker = tickerResponse['value'][0];
        const timestamp = this.safeString (tickerResponse, 'timestamp');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': this.safeString (ticker, 'volume_weighted_average_price'),
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': this.safeString (ticker, 'close'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': this.safeString (ticker, 'percentage'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'notional_volume'),
            'info': { orderBookResponse, tickerResponse },
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @param {string|undefined} params.order the chronological order of items in the response - 'asc' or 'desc'
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'wallet': this.walletAddress,
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 500
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (params['order'] !== undefined) {
            request['order'] = params['order'];
        }
        const extendedRequest = this.extend (request, params);
        if (extendedRequest['wallet'] === undefined) {
            throw new BadRequest (this.id + ' fetchMyTrades() walletAddress is undefined, set this.walletAddress or "address" in params');
        }
        const response = await this.publicGetFills (extendedRequest);
        response['traderAddress'] = undefined; // TODO: supply the users trader address in parseTradesCustom
        return await this.parseTrades (response, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @param {string|undefined} params.order the chronological order of items in the response - 'asc' or 'desc'
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 500
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        request['order'] = params['order'] !== undefined ? params['order'] : 'desc';
        const response = await this.publicGetFills (this.extend (request, params));
        // {
        //     value: [
        //       {
        //         epochId: '27',
        //         txOrdinal: '6',
        //         ordinal: '0',
        //         makerOrderHash: '0x87686e3ffa6b2e9c8a229a9b7fe948b504db94d376ce8e494f',
        //         amount: '0.05',
        //         symbol: 'BTCPERP',
        //         price: '22790',
        //         makerFee: '0',
        //         makerFeeSymbol: 'USDC',
        //         makerRealizedPnl: '0',
        //         takerOrderHash: '0x08fd0fd22dd23f3550d4edea3e37cceab4b9612116c14d71c0',
        //         takerFee: '2.279',
        //         takerFeeSymbol: 'USDC',
        //         takerRealizedPnl: '0',
        //         reason: '0',
        //         createdAt: '2023-01-25T20:13:12.574Z',
        //         liquidatedTrader: null,
        //         liquidatedStrategyIdHash: null
        //       },
        //       {
        //         epochId: '27',
        //         txOrdinal: '7',
        //         ordinal: '0',
        //         makerOrderHash: '0x87686e3ffa6b2e9c8a229a9b7fe948b504db94d376ce8e494f',
        //         amount: '0.01',
        //         symbol: 'BTCPERP',
        //         price: '22790',
        //         makerFee: '0',
        //         makerFeeSymbol: 'USDC',
        //         makerRealizedPnl: '0',
        //         takerOrderHash: '0x80b89184c49b710455ec17948785a07f4bb357561490a3e683',
        //         takerFee: '0.4558',
        //         takerFeeSymbol: 'USDC',
        //         takerRealizedPnl: '0',
        //         reason: '0',
        //         createdAt: '2023-01-25T20:13:18.578Z',
        //         liquidatedTrader: null,
        //         liquidatedStrategyIdHash: null
        //       },
        //     ]
        // }
        return await this.parseTradesCustom (response, market, since, limit);
    }

    async getOrderIntents (trades) {
        const result = {};
        const params = {
            'orderHash': [],
            'order': 'desc',
        };
        for (let i = 0; i < trades.length; i++) {
            params['orderHash'].push (trades[i]['takerOrderHash']);
        }
        const orderIntentResponse = await this.publicGetOrderIntents (params);
        const orderIntentResponseValue = orderIntentResponse['value'];
        for (let i = 0; i < orderIntentResponseValue.length; i++) {
            result[orderIntentResponseValue[i]['orderHash']] = orderIntentResponseValue[i];
        }
        return result;
    }

    async parseTradesCustom (trades, market = undefined, since = undefined, limit = undefined) {
        trades = this.toArray (trades);
        let result = [];
        const orderIntents = await this.getOrderIntents (trades[0]);
        for (let i = 0; i < trades[0].length; i++) {
            const trade = await this.parseTradeCustom (trades[0][i], orderIntents);
            result.push (trade);
        }
        result = this.sortBy2 (result, 'timestamp', 'id');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        const tail = (since === undefined);
        return this.filterBySymbolSinceLimit (result, symbol, since, limit, tail);
    }

    async parseTradeCustom (trade, orderIntents) {
        const id = this.safeString (trade, 'takerOrderHash') + '_' + this.safeString (trade, 'epochId') + '_' + this.safeString (trade, 'txOrdinal');
        const timestamp = this.parse8601 (this.safeString (trade, 'createdAt'));
        const datetime = this.iso8601 (timestamp);
        const symbol = this.safeString (trade, 'symbol');
        const order = this.safeString (trade, 'takerOrderHash');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const fee = {
            'cost': this.safeString (trade, 'takerFee'),
            'currency': this.safeString (trade, 'takerFeeSymbol'),
        };
        const takerOrderHash = this.safeString (trade, 'takerOrderHash');
        const sideNumber = this.safeInteger (orderIntents[takerOrderHash], 'side');
        const orderTypeNumber = this.safeInteger (orderIntents[takerOrderHash], 'orderType');
        const side = sideNumber === 0 ? 'buy' : 'sell';
        const orderType = this.getOrderType (orderTypeNumber);
        // liquidations have will null takerOrderHash
        const takerOrMaker = takerOrderHash !== null ? 'taker' : 'maker';
        // TODO: enable this for fetchMyTrades()
        // if (trade['traderAddress'] !== undefined && trade['traderAddress'] !== this.safeString (trade['order_intents'][takerOrderHash], 'traderAddress')) {
        //     takerOrMaker = 'maker';
        // }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': orderType,
            'takerOrMaker': takerOrMaker, // TODO: provide 'taker' as default value for public trades, but determine if maker is appropriate if this is called with an account context i,e the makerOrderHash originates from the trader address
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'fee': fee,
        });
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        // value: [
        //     {
        //       traderAddress: '0x004404ac8bd8f9618d27ad2f1485aa1b2cfd82482d',
        //       strategyId: 'main',
        //       orderHash: '0x2e401956ae605a3a222bd92533260103a23a963e6e55b066a0',
        //       symbol: 'BTCPERP',
        //       amount: '0.035',
        //       price: '23000',
        //       side: '0',
        //       originalAmount: '0.04',
        //       bookOrdinal: '0'
        //     },
        //     {
        //       traderAddress: '0x004404ac8bd8f9618d27ad2f1485aa1b2cfd82482d',
        //       strategyId: 'main',
        //       orderHash: '0x746be891d408f6e415760241c86d9c852a17514d59299a78de',
        //       symbol: 'BTCPERP',
        //       amount: '0.08',
        //       price: '24000',
        //       side: '1',
        //       originalAmount: '0.08',
        //       bookOrdinal: '1'
        //     }
        //   ]
        const responseValue = response['value'];
        const timestamp = this.safeInteger (response, 'timestamp');
        const result = {
            'symbol': symbol,
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': undefined,
            'nonce': undefined,
        };
        for (let i = 0; i < responseValue.length; i++) {
            const order = responseValue[i];
            const side = (order['side'] === '0') ? 'bids' : 'asks';
            const amount = this.safeNumber (order, 'amount');
            const price = this.safeNumber (order, 'price');
            result[side].push ([ price, amount ]);
        }
        result['bids'].reverse ();
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const fromTimestamp = this.getTimeForOhlcvRequest (this.timeframes[timeframe], since);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
            'from': fromTimestamp / 1000,
        };
        if (limit !== undefined) {
            request['to'] = this.getToParamForOhlcvRequest (this.timeframes[timeframe], fromTimestamp, limit) / 1000;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.v2GetRestOhlcv (this.extend (request, params));
        return this.parseOHLCVs (response['ohlcv'], market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        const timestamp = this.safeInteger (ohlcv, 'timestamp');
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        const volume = this.safeNumber (ohlcv, 'volume');
        return [ timestamp, open, high, low, close, volume ];
    }

    getTimeForOhlcvRequest (interval, time) {
        const msInMinute = 60 * 1000;
        const msInHour = 60 * 1000 * 60;
        const msInDay = 60 * 1000 * 60 * 24;
        if (interval === '1m') {
            return Math.ceil (time / msInMinute) * msInMinute;
        }
        if (interval === '1h') {
            return Math.ceil (time / msInHour) * msInHour;
        }
        if (interval === '1d') {
            return Math.ceil (time / msInDay) * msInDay;
        }
    }

    getToParamForOhlcvRequest (interval, from, limit) {
        const msInMinute = 60 * 1000;
        const msInHour = 60 * 1000 * 60;
        const msInDay = 60 * 1000 * 60 * 24;
        if (interval === '1m') {
            return from + (msInMinute * limit);
        }
        if (interval === '1h') {
            return from + (msInHour * limit);
        }
        if (interval === '1d') {
            return from + (msInDay * limit);
        }
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderHash': [ id ],
        };
        const response = await this.publicGetOrderIntents (request);
        return await this.parseOrders (response['value'], market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {string|undefined} params.order the chronological order of items in the response - 'asc' or 'desc'
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (params['order'] !== undefined) {
            request['order'] = params['order'];
        }
        const response = await this.publicGetOrderIntents (request);
        return await this.parseOrders (response['value'], market, since, limit);
    }

    async parseOrder (order, market = undefined) {
        // {
        //     "epochId":"1",
        //     "txOrdinal":"7",
        //     "orderHash":"0x2e401956ae605a3a222bd92533260103a23a963e6e55b066a0",
        //     "symbol":"BTCPERP",
        //     "amount":"0.04",
        //     "price":"23000",
        //     "side":0,
        //     "orderType":0,
        //     "stopPrice":"0",
        //     "nonce":"0x00000000000000000000000000000000000000000000000000000185f46343ae",
        //     "signature":"0xe5de522ee59134005016dd9e1f59b625052551c2f722261c3a31060c792384ba0152361624013a46685adf163335e4cc8006bfedfadb3896c2f5910d1391fc131b",
        //     "createdAt":"2023-01-27T18:00:26.960Z",
        //     "traderAddress":"0x004404ac8bd8f9618d27ad2f1485aa1b2cfd82482d",
        //     "strategyId":"main"
        // }
        const id = this.safeString (order, 'orderHash');
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const datetime = this.iso8601 (timestamp);
        const lastTradeTimestamp = undefined;
        const status = undefined;
        const symbol = this.safeString (order, 'symbol');
        // const orderHash = this.safeString (order, 'orderHash');
        const sideNumber = this.safeInteger (order, 'side');
        const orderTypeNumber = this.safeInteger (order, 'orderType');
        const side = sideNumber === 0 ? 'buy' : 'sell';
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        // const params = {
        //     'orderHash': [orderHash],
        // };
        // const fillsResponse = await this.publicGetFills (params);
        // const trades = fillsResponse['value'];
        const orderType = this.getOrderType (orderTypeNumber);
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': 'GTC',
            'side': side,
            'price': price,
            'average': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        }, market);
    }

    getOrderType (orderTypeNumber) {
        if (orderTypeNumber === 0) {
            return 'limit';
        } else if (orderTypeNumber === 1) {
            return 'market';
        } else if (orderTypeNumber === 2) {
            return 'stop';
        }
    }

    orderTypeToInt (orderTypeString) {
        if (orderTypeString === 'Limit') {
            return 0;
        } else if (orderTypeString === 'Market') {
            return 1;
        } else {
            return 2;
        }
    }

    orderSideToInt (orderSide) {
        if (orderSide === 'Bid') {
            return 0;
        } else {
            return 1;
        }
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by derivadex cancelOrder ()
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderIntent = this.getOperatorCancelOrderIntent (market, id);
        return await this.getOperatorResponseForOrderIntent (orderIntent, 'CancelOrder'); // TODO: this should return an Order obj
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = this.capitalize (type);
        const orderIntent = this.getOperatorSubmitOrderIntent (market, side, orderType, amount, price);
        return await this.getOperatorResponseForOrderIntent (orderIntent, 'Order'); // TODO: this should return an Order obj
    }

    async getOperatorResponseForOrderIntent (orderIntent, requestType) {
        // get the scaled order intent
        const scaledOrderIntent = requestType === 'Order' ? this.getScaledOrderIntent (orderIntent) : orderIntent;
        // get the order intent typed data
        const [ addressesResponse, encryptionKey ] = await Promise.all ([
            this.publicGetSnapshotAddresses ({ 'contractDeployment': 'beta' }), // TODO: switch to mainnet deployment,
            this.v2GetEncryptionkey (),
        ]);
        const typedData = this.transformTypedDataForEthers (
            this.createOrderIntentTypedData (
                scaledOrderIntent,
                addressesResponse['chainId'],
                addressesResponse['addresses']['derivaDEXAddress']
            )
        );
        // get the order signature
        const typedDataHash = this.hash (JSON.stringify (typedData), 'keccak', 'hex');
        const signature = this.signMessageString (typedDataHash, this.privateKey);
        orderIntent['signature'] = signature;
        const intent = { 't': requestType, 'c': orderIntent };
        // encrypt intent
        const encryptedIntent = await this.encryptIntent (encryptionKey, intent);
        // get the 21 byte trader address
        const twentyOneByteAccount = this.addDiscriminant (this.walletAddress);
        // make the request
        return await this.publicv2GetRequest ({ 'traderAddress': twentyOneByteAccount, 'encryptedIntent': encryptedIntent });
    }

    addDiscriminant (traderAddress) {
        // TODO: look up / resolve discriminant from chainId -- hard coding 00 for ethereum for now
        const prefix = '0x00';
        return `${prefix}${traderAddress.slice (2)}`;
    }

    asNonce (num) {
        return `0x${num.toString (16).padStart (64, '0')}`;
    }

    getOperatorSubmitOrderIntent (symbol, side, orderType, amount, price) {
        return {
            'traderAddress': this.walletAddress,
            'symbol': symbol,
            'strategy': 'main',
            'side': side === 'buy' ? 'Bid' : 'Ask',
            'orderType': orderType,
            'nonce': this.asNonce (Date.now ()),
            'amount': this.BigInt (amount),
            'price': this.BigInt (price),
            'stopPrice': this.BigInt (0),
            'signature': '0x0',
        };
    }

    getOperatorCancelOrderIntent (symbol, orderHash) {
        const ZERO_PADDING = '00000000000000';
        return {
            'symbol': symbol,
            'nonce': this.asNonce (Date.now ()),
            'signature': '0x',
            'orderHash': orderHash + ZERO_PADDING,
        };
    }

    getScaledOrderIntent (intent) {
        const operatorDecimals = 6;
        const operatorDecimalMultiplier = this.BigInt (10) ** operatorDecimals;
        // TODO: resolve spread operator not working and use that instead
        return {
            'traderAddress': intent['traderAddress'],
            'symbol': intent['symbol'],
            'strategy': intent['strategy'],
            'side': intent['side'],
            'orderType': intent['orderType'],
            'nonce': intent['nonce'],
            'amount': intent['amount'] * operatorDecimalMultiplier,
            'price': intent['price'] * operatorDecimalMultiplier,
            'stopPrice': intent['stopPrice'] * operatorDecimalMultiplier,
            'signature': intent['signature'],
        };
    }

    transformTypedDataForEthers (typedData) {
        return {
            'domain': typedData.domain,
            'types': this.omit (typedData.types, 'EIP712Domain'),
            'value': typedData.message,
        };
    }

    encodeStringIntoBytes32 (str) {
        let bytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
        // Convert the string to a UTF-8 byte array
        const utf8Bytes = new TextEncoder ().encode (str);
        // Copy the bytes from the UTF-8 array to the bytes32 string, up to 32 bytes
        for (let i = 0; i < utf8Bytes.length && i < 32; i++) {
            const hexByte = utf8Bytes[i].toString (16).padStart (2, '0');
            bytes32 = bytes32.substring (0, 2 + (i * 2)) + hexByte + bytes32.substring (4 + (i * 2));
        }
        return bytes32;
    }

    createOrderIntentTypedData (orderIntent, chainId, verifyingContractAddress) {
        return {
            'primaryType': 'OrderParams',
            'types': {
                'EIP712Domain': [
                    { 'name': 'name', 'type': 'string' },
                    { 'name': 'version', 'type': 'string' },
                    { 'name': 'chainId', 'type': 'uint256' },
                    { 'name': 'verifyingContract', 'type': 'address' },
                ],
                'OrderParams': [
                    { 'name': 'symbol', 'type': 'bytes32' },
                    { 'name': 'strategy', 'type': 'bytes32' },
                    { 'name': 'side', 'type': 'uint256' },
                    { 'name': 'orderType', 'type': 'uint256' },
                    { 'name': 'nonce', 'type': 'bytes32' },
                    { 'name': 'amount', 'type': 'uint256' },
                    { 'name': 'price', 'type': 'uint256' },
                    { 'name': 'stopPrice', 'type': 'uint256' },
                ],
            },
            'domain': this.createEIP712DomainSeperator (chainId, verifyingContractAddress),
            'message': {
                'symbol': this.encodeStringIntoBytes32 (orderIntent.symbol),
                'strategy': this.encodeStringIntoBytes32 (orderIntent.strategy),
                'side': this.orderSideToInt (orderIntent.side).toString (),
                'orderType': this.orderTypeToInt (orderIntent.orderType).toString (),
                'nonce': orderIntent.nonce,
                'amount': orderIntent.amount.toString (),
                'price': orderIntent.price.toString (),
                'stopPrice': orderIntent.stopPrice.toString (),
            },
        };
    }

    createEIP712DomainSeperator (chainId, verifyingContractAddress) {
        return {
            'name': 'DerivaDEX',
            'version': '1',
            'chainId': chainId,
            'verifyingContract': verifyingContractAddress,
        };
    }

    async encryptIntent (encryptionKey, payload) {
        // Create an ephemeral ECDSA private key to encrypt the request.
        // Either create a new key for each request or reuse by storing in local storage.
        // Eventually, if we want to replace eip712 signing each request by an authentication key,
        // we can use pseudo-randomness with a seed to let users backup their key.
        // For now, users don't care about their key after sending each request.
        const secretKeyBytes = new Uint8Array (this.randomBytes (32));
        // Unique single-use nonce for each encryption.
        // It is important to never repeat nonces.
        const nonceBytes = new Uint8Array (this.randomBytes (12));
        const json = JSON.stringify (payload);
        const buffer = Buffer.from (json);
        // We use native Uint8Array where possible to avoid unnecessary string operations.
        const requestBytes = new Uint8Array (buffer);
        const encryptedBytes = this.encrypt (requestBytes, secretKeyBytes, encryptionKey, nonceBytes);
        return this.hexlify (encryptedBytes);
    }

    encrypt (requestBytes, secretKeyBytes, encryptionKey, nonceBytes) {
        const privateKey = secp256k1.privateKeyCreate (secretKeyBytes);
        const compressedPublicKey = secp256k1.publicKeyConvert (privateKey.publicKey, true);
        const sharedSecret = secp256k1.ecdh (encryptionKey, secretKeyBytes);
        const sharedSecretBytes = Buffer.from (sharedSecret);
        const derivedKey = this.hash (sharedSecretBytes, 'keccak', 'binary').subarray (0, 16);
        const cipher = crypto.createCipheriv ('aes-256-gcm', derivedKey, nonceBytes);
        let ciphertext = cipher.update (requestBytes, 'utf8', 'base64');
        ciphertext += cipher.final ('base64');
        // we should not need to append ciphertext + ciphertext.getAuthTag() because it should already be included by final()
        return ciphertext + nonceBytes + compressedPublicKey;
    }

    hexlify (input) {
        if (typeof input === 'number') {
            return `0x${input.toString (16)}`;
        }
        if (typeof input === 'string') {
            return `0x${Buffer.from (input, 'utf8').toString ('hex')}`;
        }
        if (Buffer.isBuffer (input)) {
            return `0x${input.toString ('hex')}`;
        }
        if (typeof input === 'object' && input.toHexString) {
            return input.toHexString ();
        }
    }

    sign (path, api = 'stats', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const implodedPath = this.implodeParams (path, params);
        let query = (api === 'v2' ? '' : '/api/') + (api === 'v2' ? '' : this.version) + '/' + implodedPath;
        if (method === 'GET') {
            if (params['orderHash'] !== undefined) {
                let orderHashParam = '';
                for (let i = 0; i < params['orderHash'].length; i++) {
                    orderHashParam += (i > 0 ? '&' : '') + 'orderHash=' + params['orderHash'][i];
                }
                query += '?' + orderHashParam;
                delete params['orderHash'];
            }
            if (Object.keys (params).length) {
                query += '?' + this.urlencode (params);
            }
        } else {
            const format = this.safeString (params, '_format');
            if (format !== undefined) {
                query += '?' + this.urlencode ({ '_format': format });
                params = this.omit (params, '_format');
            }
        }
        const testApi = api === 'v2' ? 'v2' : 'op1'; // TODO: SWITCH TO MAINNET URL
        const url = this.urls['test'][testApi] + query; // TODO: SWITCH TO MAINNET URL
        const isAuthenticated = this.checkRequiredCredentials (false);
        if (api === 'private' || (api === 'public' && isAuthenticated)) {
            this.checkRequiredCredentials ();
            let auth = method + query;
            let expires = this.safeInteger (this.options, 'api-expires');
            headers = {
                'Content-Type': 'application/json',
                'api-key': this.apiKey,
            };
            expires = this.sum (this.seconds (), expires);
            expires = expires.toString ();
            auth += expires;
            headers['api-expires'] = expires;
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                    auth += body;
                }
            }
            headers['api-signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
