// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockBattleToken
 * @dev Mock contract para testing del token $BATTLE
 */
contract MockBattleToken is ERC20, Ownable {
    
    constructor(address initialOwner) ERC20("Battle Token", "BATTLE") Ownable(initialOwner) {}
    
    /**
     * @dev Función para mint tokens (solo para testing)
     * @param to Dirección que recibirá los tokens
     * @param amount Cantidad de tokens a mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Función para quemar tokens
     * @param amount Cantidad de tokens a quemar
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
