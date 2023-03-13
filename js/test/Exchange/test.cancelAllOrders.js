'use strict'

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {
    console.log ('derivadex cancel all orders test ...')
    const orderResult = await exchange['cancelAllOrders'] ('BTCPERP', {});
    console.log (orderResult)
}
