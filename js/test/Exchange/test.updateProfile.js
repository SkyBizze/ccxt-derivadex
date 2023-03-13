'use strict'

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {
    console.log ('derivadex update profile test ...')
    const result = await exchange['updateProfile'] (false);
    console.log (result)
}
