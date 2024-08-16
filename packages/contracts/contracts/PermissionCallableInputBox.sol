// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IInputBox} from "@cartesi/rollups/contracts/inputs/IInputBox.sol";
import {InputRelay} from "@cartesi/rollups/contracts/inputs/InputRelay.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {PermissionCallable} from "./PermissionCallable.sol";

contract PermissionCallableInputBox is
    IInputBox,
    InputRelay,
    PermissionCallable
{
    constructor(IInputBox _inputBox) InputRelay(_inputBox) {}

    function addInput(
        address _dapp,
        bytes calldata _input
    ) external returns (bytes32) {
        // encode original msg sender (smart wallet)
        bytes memory input = abi.encodePacked(msg.sender, _input);
        return this.getInputBox().addInput(_dapp, input);
    }

    function getInputHash(
        address _dapp,
        uint256 _index
    ) external view returns (bytes32) {
        return this.getInputBox().getInputHash(_dapp, _index);
    }

    function getNumberOfInputs(address _dapp) external view returns (uint256) {
        return this.getInputBox().getNumberOfInputs(_dapp);
    }

    function supportsPermissionedCallSelector(
        bytes4 selector
    ) public pure override returns (bool) {
        return selector == PermissionCallableInputBox.addInput.selector;
    }
}
