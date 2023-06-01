// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ERC20TokenClone} from "../base/ERC20TokenClone.sol";

contract BGClone is ERC20TokenClone {
  constructor() ERC20TokenClone(0x186B2a618faf5B7528896bEB58C5b1dC17266c59, "BuidlGuidl Clone", "BGc") {}
}
