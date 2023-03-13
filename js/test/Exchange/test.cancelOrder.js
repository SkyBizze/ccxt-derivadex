'use strict'

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {
    console.log ('derivadex cancel order test ...')
    const orderResult = await exchange['cancelOrder'] ('0x6bed7b04c617411d9ce3eb6319e19155daee0612759623690b', 'BTCPERP', {});
    console.log (orderResult)
}
