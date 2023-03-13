'use strict'

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {
    console.log ('derivadex create order test ...')
    const orderResult = await exchange['createOrder'] ('BTCPERP', 'limit', 'buy', 0.0019, 22500, {});
    console.log (orderResult)
}
