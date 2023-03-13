'use strict'

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {
    console.log ('derivadex fetch funding rate singular test ...')
    const result = await exchange['fetchFundingRate'] ('ETHPERP', {});
    console.log (result)
}
