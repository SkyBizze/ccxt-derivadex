'use strict'

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {
    console.log ('derivadex fetch funding rates test ...')
    const result = await exchange['fetchFundingRates'] (['ETHPERP'], {});
    console.log (result)
}
