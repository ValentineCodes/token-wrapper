// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error L2TokenClone__NonceAlreadyProcessed();

contract L2TokenClone is ERC20, Ownable {
  event Withdraw(address owner, uint256 amount, uint256 nonce);

  constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

  uint256 public nonce;

  mapping(address owner => mapping(uint256 nonce => bool)) private s_processedNonce;

  function burn(uint256 amount) public {
    _burn(msg.sender, amount);

    nonce++;

    emit Withdraw(msg.sender, amount, nonce);
  }

  function mint(address to, uint256 amount, uint256 otherChainNonce) public onlyOwner {
    if (s_processedNonce[to][otherChainNonce]) revert L2TokenClone__NonceAlreadyProcessed();

    s_processedNonce[to][otherChainNonce] = true;

    _mint(to, amount);
  }
}
