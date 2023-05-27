// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {TokenClone} from "./TokenClone.sol";
import {ITokenCloner} from "./interfaces/ITokenCloner.sol";

error TokenCloner__TokenExists();
error TokenCloner__NameExists();
error TokenCloner__SymbolExists();
error TokenCloner__ZeroAddress();
error TokenCloner__EmptyName();
error TokenCloner__EmptySymbol();

contract TokenCloner is ITokenCloner, Ownable {
  address[] private s_cTokens;

  mapping(address underlyingToken => bool) private s_hasToken;
  mapping(string name => bool) private s_hasName;
  mapping(string symbol => bool) private s_hasSymbol;

  function createClone(address underlyingToken, string calldata name, string calldata symbol) public onlyOwner {
    if (bytes(name).length == 0) revert TokenCloner__EmptyName();
    if (bytes(symbol).length == 0) revert TokenCloner__EmptySymbol();

    if (s_hasToken[underlyingToken]) revert TokenCloner__TokenExists();
    if (s_hasName[name]) revert TokenCloner__NameExists();
    if (s_hasSymbol[symbol]) revert TokenCloner__SymbolExists();

    TokenClone cToken = new TokenClone(IERC20(underlyingToken), name, symbol);

    address cTokenAddress = address(cToken);

    s_cTokens.push(cTokenAddress);
    s_hasToken[underlyingToken] = true;
    s_hasName[name] = true;
    s_hasSymbol[symbol] = true;

    emit CloneCreated(cTokenAddress);
  }

  function getTokenClones() public view returns (address[] memory) {
    return s_cTokens;
  }

  function hasToken(address underlyingToken) public view returns (bool) {
    return s_hasToken[underlyingToken];
  }

  function hasName(string calldata name) public view returns (bool) {
    return s_hasName[name];
  }

  function hasSymbol(string calldata symbol) public view returns (bool) {
    return s_hasSymbol[symbol];
  }
}
