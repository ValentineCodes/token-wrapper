// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ERC20TokenClone} from "../base/ERC20TokenClone.sol";

contract BGClone is ERC20TokenClone {
  constructor() ERC20TokenClone(address(0), "BuidlGuidl Clone", "cBG") {}
}
