// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ClonedToken} from "./ClonedToken.sol";
import {IClonedTokenGenerator} from "./interfaces/IClonedTokenGenerator.sol";

error ClonedTokenGenerator__TokenExists();
error ClonedTokenGenerator__NameExists();
error ClonedTokenGenerator__SymbolExists();
error ClonedTokenGenerator__ZeroAddress();
error ClonedTokenGenerator__EmptyName();
error ClonedTokenGenerator__EmptySymbol();

contract ClonedTokenGenerator is IClonedTokenGenerator, Ownable {
  address[] public s_cTokens;

  mapping(address underlyingToken => bool) private s_hasToken;
  mapping(string name => bool) private s_hasName;
  mapping(string symbol => bool) private s_hasSymbol;

  function createClone(address underlyingToken, string calldata name, string calldata symbol) public onlyOwner {
    if (bytes(name).length == 0) revert ClonedTokenGenerator__EmptyName();
    if (bytes(symbol).length == 0) revert ClonedTokenGenerator__EmptySymbol();

    if (s_hasToken[underlyingToken]) revert ClonedTokenGenerator__TokenExists();
    if (s_hasName[name]) revert ClonedTokenGenerator__NameExists();
    if (s_hasName[symbol]) revert ClonedTokenGenerator__SymbolExists();

    ClonedToken cToken = new ClonedToken(IERC20(underlyingToken), name, symbol);

    address cTokenAddress = address(cToken);

    s_cTokens.push(cTokenAddress);
    s_hasToken[underlyingToken] = true;
    s_hasName[name] = true;
    s_hasSymbol[symbol] = true;

    emit CloneCreated(cTokenAddress);
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
