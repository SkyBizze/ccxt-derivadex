'use strict'

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {
    console.log ('derivadex fetch deposit address test ...')
    const result = await exchange['fetchDepositAddress'] ('USDC', {});
    console.log (result)
}
