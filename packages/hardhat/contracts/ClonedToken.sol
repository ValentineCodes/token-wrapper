// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC20, IERC20, IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ClonedToken is ERC20, Ownable {
  IERC20 public immutable underlying;

  constructor(IERC20 underlyingToken, string memory name, string memory symbol) ERC20(name, symbol) {
    underlying = underlyingToken;
  }

  /**
   * @dev See {ERC20-decimals}.
   */
  function decimals() public view virtual override returns (uint8) {
    try IERC20Metadata(address(underlying)).decimals() returns (uint8 value) {
      return value;
    } catch {
      return super.decimals();
    }
  }

  function depositFor(address account, uint256 amount) public returns (bool) {
    SafeERC20.safeTransferFrom(underlying, _msgSender(), address(this), amount);
    _mint(account, amount);
    return true;
  }

  function withdrawTo(address account, uint256 amount) public returns (bool) {
    _burn(_msgSender(), amount);
    SafeERC20.safeTransfer(underlying, account, amount);
    return true;
  }

  function recover(address account) public onlyOwner returns (uint256) {
    uint256 value = underlying.balanceOf(address(this)) - totalSupply();
    _mint(account, value);
    return value;
  }
}
