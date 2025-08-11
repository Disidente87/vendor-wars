const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VendorRegistration", function () {
    let vendorRegistration;
    let mockBattleToken;
    let owner;
    let user1;
    let user2;
    let user3;
    
    const VENDOR_REGISTRATION_COST = ethers.parseEther("50"); // 50 tokens
    const MAX_VENDORS_PER_DAY = 3;
    const MAX_VENDORS_PER_WEEK = 10;
    const COOLDOWN_PERIOD = 3600; // 1 hora en segundos
    
    beforeEach(async function () {
        // Obtener cuentas
        [owner, user1, user2, user3] = await ethers.getSigners();
        
        // Deploy MockBattleToken
        const MockBattleToken = await ethers.getContractFactory("MockBattleToken");
        mockBattleToken = await MockBattleToken.deploy(owner.address);
        
        // Deploy VendorRegistration
        const VendorRegistration = await ethers.getContractFactory("VendorRegistration");
        vendorRegistration = await VendorRegistration.deploy(
            mockBattleToken.target,
            owner.address
        );
        
        // Mint tokens a los usuarios para testing
        await mockBattleToken.mint(user1.address, ethers.parseEther("1000"));
        await mockBattleToken.mint(user2.address, ethers.parseEther("1000"));
        await mockBattleToken.mint(user3.address, ethers.parseEther("1000"));
        
        // Aprobar gasto de tokens al contrato VendorRegistration
        await mockBattleToken.connect(user1).approve(vendorRegistration.target, ethers.parseEther("1000"));
        await mockBattleToken.connect(user2).approve(vendorRegistration.target, ethers.parseEther("1000"));
        await mockBattleToken.connect(user3).approve(vendorRegistration.target, ethers.parseEther("1000"));
    });
    
    describe("Constructor", function () {
        it("Should set correct initial values", async function () {
            expect(await vendorRegistration.battleToken()).to.equal(mockBattleToken.target);
            expect(await vendorRegistration.owner()).to.equal(owner.address);
            expect(await vendorRegistration.getVendorRegistrationCost()).to.equal(VENDOR_REGISTRATION_COST);
        });
        
        it("Should revert with invalid token address", async function () {
            const VendorRegistration = await ethers.getContractFactory("VendorRegistration");
            await expect(
                VendorRegistration.deploy(ethers.ZeroAddress, owner.address)
            ).to.be.revertedWith("Invalid token address");
        });
        
        it("Should revert with invalid owner address", async function () {
            const VendorRegistration = await ethers.getContractFactory("VendorRegistration");
            await expect(
                VendorRegistration.deploy(mockBattleToken.target, ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid owner address");
        });
    });
    
    describe("Vendor Registration", function () {
        it("Should register vendor successfully and burn tokens", async function () {
            const vendorId = "vendor_001";
            const vendorData = "Test Vendor Data";
            const user1BalanceBefore = await mockBattleToken.balanceOf(user1.address);
            const contractBalanceBefore = await mockBattleToken.balanceOf(vendorRegistration.target);
            
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    vendorId
                )
            ).to.emit(vendorRegistration, "VendorRegistered")
             .withArgs(user1.address, VENDOR_REGISTRATION_COST, vendorId, await time());
            
            // Verificar que los tokens fueron quemados
            const user1BalanceAfter = await mockBattleToken.balanceOf(user1.address);
            const contractBalanceAfter = await mockBattleToken.balanceOf(vendorRegistration.target);
            
            expect(user1BalanceAfter).to.equal(user1BalanceBefore - VENDOR_REGISTRATION_COST);
            expect(contractBalanceAfter).to.equal(contractBalanceBefore); // Los tokens se queman, no se quedan en el contrato
            
            // Verificar información del vendor
            const vendorInfo = await vendorRegistration.getVendorInfo(vendorId);
            expect(vendorInfo.user).to.equal(user1.address);
            expect(vendorInfo.amount).to.equal(VENDOR_REGISTRATION_COST);
            expect(vendorInfo.exists).to.be.true;
            
            // Verificar contadores
            expect(await vendorRegistration.getTotalVendorsRegistered()).to.equal(1);
            expect(await vendorRegistration.getTotalTokensBurned()).to.equal(VENDOR_REGISTRATION_COST);
        });
        
        it("Should revert if user has insufficient balance", async function () {
            const vendorId = "vendor_002";
            const vendorData = "Test Vendor Data";
            
            // Usuario sin tokens
            const poorUser = user3;
            await mockBattleToken.connect(poorUser).approve(vendorRegistration.target, VENDOR_REGISTRATION_COST);
            
            await expect(
                vendorRegistration.registerVendor(
                    poorUser.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    vendorId
                )
            ).to.be.revertedWith("Insufficient balance");
        });
        
        it("Should revert if amount is not exactly 50 tokens", async function () {
            const vendorId = "vendor_003";
            const vendorData = "Test Vendor Data";
            const wrongAmount = ethers.parseEther("25"); // Solo 25 tokens
            
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    wrongAmount,
                    vendorData,
                    vendorId
                )
            ).to.be.revertedWith("Invalid amount");
        });
        
        it("Should revert if vendor data is empty", async function () {
            const vendorId = "vendor_004";
            const emptyData = "";
            
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    emptyData,
                    vendorId
                )
            ).to.be.revertedWith("Empty vendor data");
        });
        
        it("Should revert if vendor ID is empty", async function () {
            const emptyId = "";
            const vendorData = "Test Vendor Data";
            
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    emptyId
                )
            ).to.be.revertedWith("Empty vendor ID");
        });
        
        it("Should revert if vendor already exists", async function () {
            const vendorId = "vendor_005";
            const vendorData = "Test Vendor Data";
            
            // Primer registro exitoso
            await vendorRegistration.registerVendor(
                user1.address,
                VENDOR_REGISTRATION_COST,
                vendorData,
                vendorId
            );
            
            // Intentar registrar el mismo vendor ID
            await expect(
                vendorRegistration.registerVendor(
                    user2.address,
                    VENDOR_REGISTRATION_COST,
                    "Different Data",
                    vendorId
                )
            ).to.be.revertedWith("Vendor already exists");
        });
        
        it("Should revert if called by non-owner", async function () {
            const vendorId = "vendor_006";
            const vendorData = "Test Vendor Data";
            
            await expect(
                vendorRegistration.connect(user1).registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    vendorId
                )
            ).to.be.revertedWithCustomError(vendorRegistration, "OwnableUnauthorizedAccount");
        });
    });
    
    describe("Rate Limiting", function () {
        it("Should enforce daily limit", async function () {
            const vendorData = "Test Vendor Data";
            
            // Registrar 3 vendors (límite diario)
            for (let i = 0; i < MAX_VENDORS_PER_DAY; i++) {
                await vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    `vendor_daily_${i}`
                );
            }
            
            // Intentar registrar un cuarto vendor en el mismo día
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    "vendor_daily_4"
                )
            ).to.be.revertedWith("Daily limit exceeded");
        });
        
        it("Should enforce weekly limit", async function () {
            const vendorData = "Test Vendor Data";
            
            // Registrar 10 vendors (límite semanal)
            for (let i = 0; i < MAX_VENDORS_PER_WEEK; i++) {
                await vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    `vendor_weekly_${i}`
                );
            }
            
            // Intentar registrar un vendor adicional en la misma semana
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    "vendor_weekly_11"
                )
            ).to.be.revertedWith("Weekly limit exceeded");
        });
        
        it("Should enforce cooldown period", async function () {
            const vendorData = "Test Vendor Data";
            
            // Primer registro
            await vendorRegistration.registerVendor(
                user1.address,
                VENDOR_REGISTRATION_COST,
                vendorData,
                "vendor_cooldown_1"
            );
            
            // Intentar registrar inmediatamente después
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    "vendor_cooldown_2"
                )
            ).to.be.revertedWith("Cooldown period not met");
            
            // Avanzar tiempo para pasar el cooldown
            await time.increase(COOLDOWN_PERIOD + 1);
            
            // Ahora debería funcionar
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    "vendor_cooldown_2"
                )
            ).to.emit(vendorRegistration, "VendorRegistered");
        });
    });
    
    describe("Token Burning", function () {
        it("Should burn tokens correctly", async function () {
            const user1BalanceBefore = await mockBattleToken.balanceOf(user1.address);
            const totalSupplyBefore = await mockBattleToken.totalSupply();
            
            await vendorRegistration.burnTokens(user1.address, VENDOR_REGISTRATION_COST);
            
            const user1BalanceAfter = await mockBattleToken.balanceOf(user1.address);
            const totalSupplyAfter = await mockBattleToken.totalSupply();
            
            expect(user1BalanceAfter).to.equal(user1BalanceBefore - VENDOR_REGISTRATION_COST);
            expect(totalSupplyAfter).to.equal(totalSupplyBefore - VENDOR_REGISTRATION_COST);
        });
        
        it("Should revert burn if user has insufficient balance", async function () {
            const burnAmount = ethers.parseEther("2000"); // Más de lo que tiene
            
            await expect(
                vendorRegistration.burnTokens(user1.address, burnAmount)
            ).to.be.revertedWith("Insufficient balance for burn");
        });
        
        it("Should revert burn if called by non-owner", async function () {
            await expect(
                vendorRegistration.connect(user1).burnTokens(user1.address, VENDOR_REGISTRATION_COST)
            ).to.be.revertedWithCustomError(vendorRegistration, "OwnableUnauthorizedAccount");
        });
    });
    
    describe("Token Refunding", function () {
        it("Should refund tokens correctly", async function () {
            const refundAmount = ethers.parseEther("100");
            const reason = "System failure";
            
            // Mint tokens al contrato para poder reembolsar
            await mockBattleToken.mint(vendorRegistration.target, refundAmount);
            
            const user1BalanceBefore = await mockBattleToken.balanceOf(user1.address);
            
            await expect(
                vendorRegistration.refundTokens(user1.address, refundAmount, reason)
            ).to.emit(vendorRegistration, "TokensRefunded")
             .withArgs(user1.address, refundAmount, reason, await time());
            
            const user1BalanceAfter = await mockBattleToken.balanceOf(user1.address);
            expect(user1BalanceAfter).to.equal(user1BalanceBefore + refundAmount);
        });
        
        it("Should revert refund if called by non-owner", async function () {
            const refundAmount = ethers.parseEther("100");
            const reason = "System failure";
            
            await expect(
                vendorRegistration.connect(user1).refundTokens(user1.address, refundAmount, reason)
            ).to.be.revertedWithCustomError(vendorRegistration, "OwnableUnauthorizedAccount");
        });
        
        it("Should revert refund with empty reason", async function () {
            const refundAmount = ethers.parseEther("100");
            const emptyReason = "";
            
            await expect(
                vendorRegistration.refundTokens(user1.address, refundAmount, emptyReason)
            ).to.be.revertedWith("Empty reason");
        });
    });
    
    describe("View Functions", function () {
        it("Should return correct vendor information", async function () {
            const vendorId = "vendor_view_001";
            const vendorData = "Test Vendor Data";
            
            await vendorRegistration.registerVendor(
                user1.address,
                VENDOR_REGISTRATION_COST,
                vendorData,
                vendorId
            );
            
            const vendorInfo = await vendorRegistration.getVendorInfo(vendorId);
            expect(vendorInfo.user).to.equal(user1.address);
            expect(vendorInfo.amount).to.equal(VENDOR_REGISTRATION_COST);
            expect(vendorInfo.exists).to.be.true;
        });
        
        it("Should return false for non-existent vendor", async function () {
            const nonExistentId = "non_existent";
            const vendorInfo = await vendorRegistration.getVendorInfo(nonExistentId);
            expect(vendorInfo.exists).to.be.false;
        });
        
        it("Should check balance correctly", async function () {
            // Usuario con suficientes tokens
            expect(await vendorRegistration.hasSufficientBalance(user1.address)).to.be.true;
            
            // Usuario sin tokens
            const poorUser = user3;
            await mockBattleToken.connect(poorUser).burn(ethers.parseEther("1000"));
            expect(await vendorRegistration.hasSufficientBalance(poorUser.address)).to.be.false;
        });
        
        it("Should return correct counters", async function () {
            expect(await vendorRegistration.getTotalVendorsRegistered()).to.equal(0);
            expect(await vendorRegistration.getTotalTokensBurned()).to.equal(0);
            
            // Registrar un vendor
            await vendorRegistration.registerVendor(
                user1.address,
                VENDOR_REGISTRATION_COST,
                "Test Data",
                "vendor_counter_001"
            );
            
            expect(await vendorRegistration.getTotalVendorsRegistered()).to.equal(1);
            expect(await vendorRegistration.getTotalTokensBurned()).to.equal(VENDOR_REGISTRATION_COST);
        });
    });
    
    describe("Admin Functions", function () {
        it("Should pause and unpause contract", async function () {
            await vendorRegistration.pause();
            expect(await vendorRegistration.paused()).to.be.true;
            
            await vendorRegistration.unpause();
            expect(await vendorRegistration.paused()).to.be.false;
        });
        
        it("Should revert pause if called by non-owner", async function () {
            await expect(
                vendorRegistration.connect(user1).pause()
            ).to.be.revertedWithCustomError(vendorRegistration, "OwnableUnauthorizedAccount");
        });
        
        it("Should revert operations when paused", async function () {
            await vendorRegistration.pause();
            
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    "Test Data",
                    "vendor_paused"
                )
            ).to.be.revertedWithCustomError(vendorRegistration, "EnforcedPause");
        });
        
        it("Should allow emergency withdrawal", async function () {
            const withdrawalAmount = ethers.parseEther("100");
            
            // Mint tokens al contrato
            await mockBattleToken.mint(vendorRegistration.target, withdrawalAmount);
            
            const ownerBalanceBefore = await mockBattleToken.balanceOf(owner.address);
            
            await vendorRegistration.emergencyWithdraw(
                mockBattleToken.target,
                withdrawalAmount,
                owner.address
            );
            
            const ownerBalanceAfter = await mockBattleToken.balanceOf(owner.address);
            expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + withdrawalAmount);
        });
        
        it("Should revert emergency withdrawal if called by non-owner", async function () {
            await expect(
                vendorRegistration.connect(user1).emergencyWithdraw(
                    mockBattleToken.target,
                    ethers.parseEther("100"),
                    user1.address
                )
            ).to.be.revertedWithCustomError(vendorRegistration, "OwnableUnauthorizedAccount");
        });
    });
    
    describe("Integration Tests", function () {
        it("Should handle multiple users registering vendors", async function () {
            const vendorData = "Test Vendor Data";
            
            // Usuario 1 registra 2 vendors
            await vendorRegistration.registerVendor(
                user1.address,
                VENDOR_REGISTRATION_COST,
                vendorData,
                "vendor_user1_001"
            );
            
            await vendorRegistration.registerVendor(
                user1.address,
                VENDOR_REGISTRATION_COST,
                vendorData,
                "vendor_user1_002"
            );
            
            // Usuario 2 registra 1 vendor
            await vendorRegistration.registerVendor(
                user2.address,
                VENDOR_REGISTRATION_COST,
                vendorData,
                "vendor_user2_001"
            );
            
            // Verificar contadores
            expect(await vendorRegistration.getTotalVendorsRegistered()).to.equal(3);
            expect(await vendorRegistration.getTotalTokensBurned()).to.equal(VENDOR_REGISTRATION_COST * 3n);
            
            // Verificar contadores por usuario
            const currentDay = await vendorRegistration.getCurrentDay();
            const currentWeek = await vendorRegistration.getCurrentWeek();
            
            expect(await vendorRegistration.getDailyVendorCount(user1.address, currentDay)).to.equal(2);
            expect(await vendorRegistration.getDailyVendorCount(user2.address, currentDay)).to.equal(1);
            expect(await vendorRegistration.getWeeklyVendorCount(user1.address, currentWeek)).to.equal(2);
            expect(await vendorRegistration.getWeeklyVendorCount(user2.address, currentWeek)).to.equal(1);
        });
        
        it("Should handle edge cases correctly", async function () {
            // Verificar límites exactos
            const vendorData = "Test Vendor Data";
            
            // Llegar al límite diario
            for (let i = 0; i < MAX_VENDORS_PER_DAY; i++) {
                await vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    `vendor_limit_${i}`
                );
            }
            
            // Verificar que no se puede registrar más
            await expect(
                vendorRegistration.registerVendor(
                    user1.address,
                    VENDOR_REGISTRATION_COST,
                    vendorData,
                    "vendor_limit_extra"
                )
            ).to.be.revertedWith("Daily limit exceeded");
            
            // Verificar contadores
            const currentDay = await vendorRegistration.getCurrentDay();
            expect(await vendorRegistration.getDailyVendorCount(user1.address, currentDay)).to.equal(MAX_VENDORS_PER_DAY);
        });
    });
});

// Helper function para obtener el timestamp actual
async function time() {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    return block.timestamp;
}
