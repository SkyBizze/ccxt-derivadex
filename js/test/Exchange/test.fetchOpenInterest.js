'use strict'

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {
    console.log ('derivadex fetch OI test ...')
    const result = await exchange['fetchOpenInterest'] ('ETHPERP', {});
    console.log (result)
}
