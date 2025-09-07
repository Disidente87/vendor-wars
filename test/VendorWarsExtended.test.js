import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("VendorWarsExtended", function () {
  let vendorWarsExtended;
  let battleToken;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const BattleToken = await ethers.getContractFactory("MockERC20");
    battleToken = await BattleToken.deploy("Battle Token", "BATTLE", ethers.parseEther("1000000"));
    await battleToken.waitForDeployment();

    // Deploy VendorWarsExtended
    const VendorWarsExtended = await ethers.getContractFactory("VendorWarsExtended");
    vendorWarsExtended = await VendorWarsExtended.deploy(
      await battleToken.getAddress(),
      owner.address
    );
    await vendorWarsExtended.waitForDeployment();

    // Transfer tokens to users
    await battleToken.transfer(user1.address, ethers.parseEther("1000"));
    await battleToken.transfer(user2.address, ethers.parseEther("1000"));

    // Approve contract to spend tokens
    await battleToken.connect(user1).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("1000"));
    await battleToken.connect(user2).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await vendorWarsExtended.owner()).to.equal(owner.address);
    });

    it("Should set the correct battle token address", async function () {
      expect(await vendorWarsExtended.battleToken()).to.equal(await battleToken.getAddress());
    });

    it("Should have correct vendor registration cost", async function () {
      expect(await vendorWarsExtended.getVendorRegistrationCost()).to.equal(ethers.parseEther("50"));
    });
  });

  describe("Vendor Registration", function () {
    it("Should register a vendor successfully", async function () {
      const vendorId = "vendor1";
      const vendorData = '{"name":"Test Vendor","description":"A test vendor"}';
      const amount = ethers.parseEther("50");

      const tx = await vendorWarsExtended.registerVendor(
        user1.address,
        amount,
        vendorData,
        vendorId
      );

      await expect(tx)
        .to.emit(vendorWarsExtended, "VendorRegistered")
        .withArgs(user1.address, amount, vendorId, await tx.getBlock().then(b => b.timestamp));

      // Check vendor exists
      expect(await vendorWarsExtended.vendorExists(vendorId)).to.be.true;

      // Check vendor info
      const vendorInfo = await vendorWarsExtended.getVendorInfo(vendorId);
      expect(vendorInfo.user).to.equal(user1.address);
      expect(vendorInfo.amount).to.equal(amount);
      expect(vendorInfo.exists).to.be.true;
    });

    it("Should fail to register vendor with insufficient balance", async function () {
      const vendorId = "vendor1";
      const vendorData = '{"name":"Test Vendor","description":"A test vendor"}';
      const amount = ethers.parseEther("50");

      // Transfer only 10 tokens to user2
      await battleToken.transfer(user2.address, ethers.parseEther("10"));
      await battleToken.connect(user2).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("10"));

      await expect(
        vendorWarsExtended.registerVendor(
          user2.address,
          amount,
          vendorData,
          vendorId
        )
      ).to.be.revertedWith("Token burn failed");
    });

    it("Should fail to register vendor with wrong amount", async function () {
      const vendorId = "vendor1";
      const vendorData = '{"name":"Test Vendor","description":"A test vendor"}';
      const amount = ethers.parseEther("30"); // Wrong amount

      await expect(
        vendorWarsExtended.registerVendor(
          user1.address,
          amount,
          vendorData,
          vendorId
        )
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should fail to register vendor with empty vendor ID", async function () {
      const vendorId = "";
      const vendorData = '{"name":"Test Vendor","description":"A test vendor"}';
      const amount = ethers.parseEther("50");

      await expect(
        vendorWarsExtended.registerVendor(
          user1.address,
          amount,
          vendorData,
          vendorId
        )
      ).to.be.revertedWith("Empty vendor ID");
    });

    it("Should fail to register vendor that already exists", async function () {
      const vendorId = "vendor1";
      const vendorData = '{"name":"Test Vendor","description":"A test vendor"}';
      const amount = ethers.parseEther("50");

      // Register first time
      await vendorWarsExtended.registerVendor(
        user1.address,
        amount,
        vendorData,
        vendorId
      );

      // Try to register again
      await expect(
        vendorWarsExtended.registerVendor(
          user2.address,
          amount,
          vendorData,
          vendorId
        )
      ).to.be.revertedWith("Vendor already exists");
    });
  });

  describe("Token Burning", function () {
    it("Should burn tokens successfully", async function () {
      const amount = ethers.parseEther("10");

      const tx = await vendorWarsExtended.burnTokens(user1.address, amount);

      await expect(tx)
        .to.emit(vendorWarsExtended, "TokensBurned")
        .withArgs(user1.address, amount, await tx.getBlock().then(b => b.timestamp));

      // Check total burned tokens
      expect(await vendorWarsExtended.getTotalTokensBurned()).to.equal(amount);
    });

    it("Should fail to burn tokens with insufficient balance", async function () {
      const amount = ethers.parseEther("2000"); // More than user has

      await expect(
        vendorWarsExtended.burnTokens(user1.address, amount)
      ).to.be.revertedWith("Insufficient balance for burn");
    });
  });

  describe("Token Refunding", function () {
    it("Should refund tokens successfully", async function () {
      const amount = ethers.parseEther("10");
      const reason = "Test refund";

      // First burn some tokens to have them in the contract
      await vendorWarsExtended.burnTokens(user1.address, amount);

      const tx = await vendorWarsExtended.refundTokens(user1.address, amount, reason);

      await expect(tx)
        .to.emit(vendorWarsExtended, "TokensRefunded")
        .withArgs(user1.address, amount, reason, await tx.getBlock().then(b => b.timestamp));
    });

    it("Should fail to refund with empty reason", async function () {
      const amount = ethers.parseEther("10");
      const reason = "";

      await expect(
        vendorWarsExtended.refundTokens(user1.address, amount, reason)
      ).to.be.revertedWith("Empty reason");
    });
  });

  describe("View Functions", function () {
    it("Should return correct vendor registration cost", async function () {
      expect(await vendorWarsExtended.getVendorRegistrationCost()).to.equal(ethers.parseEther("50"));
    });

    it("Should check sufficient balance correctly", async function () {
      expect(await vendorWarsExtended.hasSufficientBalance(user1.address)).to.be.true;
      
      // Create a new user with small balance
      const [, , , user3] = await ethers.getSigners();
      await battleToken.transfer(user3.address, ethers.parseEther("10"));
      expect(await vendorWarsExtended.hasSufficientBalance(user3.address)).to.be.false;
    });

    it("Should return correct totals", async function () {
      expect(await vendorWarsExtended.getTotalTokensBurned()).to.equal(0);
      expect(await vendorWarsExtended.getTotalVendorsRegistered()).to.equal(0);

      // Register a vendor
      await vendorWarsExtended.registerVendor(
        user1.address,
        ethers.parseEther("50"),
        '{"name":"Test Vendor","description":"A test vendor"}',
        "vendor1"
      );

      expect(await vendorWarsExtended.getTotalTokensBurned()).to.equal(ethers.parseEther("50"));
      expect(await vendorWarsExtended.getTotalVendorsRegistered()).to.equal(1);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to register vendors", async function () {
      await expect(
        vendorWarsExtended.connect(user1).registerVendor(
          user1.address,
          ethers.parseEther("50"),
          '{"name":"Test Vendor","description":"A test vendor"}',
          "vendor1"
        )
      ).to.be.revertedWithCustomError(vendorWarsExtended, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to burn tokens", async function () {
      await expect(
        vendorWarsExtended.connect(user1).burnTokens(user1.address, ethers.parseEther("10"))
      ).to.be.revertedWithCustomError(vendorWarsExtended, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to refund tokens", async function () {
      await expect(
        vendorWarsExtended.connect(user1).refundTokens(user1.address, ethers.parseEther("10"), "reason")
      ).to.be.revertedWithCustomError(vendorWarsExtended, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause correctly", async function () {
      await vendorWarsExtended.pause();
      expect(await vendorWarsExtended.paused()).to.be.true;

      await vendorWarsExtended.unpause();
      expect(await vendorWarsExtended.paused()).to.be.false;
    });

    it("Should not allow operations when paused", async function () {
      await vendorWarsExtended.pause();

      await expect(
        vendorWarsExtended.registerVendor(
          user1.address,
          ethers.parseEther("50"),
          '{"name":"Test Vendor","description":"A test vendor"}',
          "vendor1"
        )
      ).to.be.revertedWithCustomError(vendorWarsExtended, "EnforcedPause");
    });
  });

  describe("Extended Functions", function () {
    beforeEach(async function () {
      // Register a vendor first for testing
      await vendorWarsExtended.registerVendor(
        user1.address,
        ethers.parseEther("50"),
        '{"name":"Test Vendor","description":"A test vendor"}',
        "vendor1"
      );
    });

    describe("updateVendorInfo", function () {
      it("Should update vendor info successfully", async function () {
        const tx = await vendorWarsExtended.updateVendorInfo(
          user1.address,
          "vendor1",
          "Updated Vendor",
          "Updated description",
          "Updated category",
          ethers.parseEther("2")
        );

        await expect(tx)
          .to.emit(vendorWarsExtended, "VendorInfoUpdated")
          .withArgs("vendor1", "Updated Vendor", "Updated description", "Updated category");
      });

      it("Should fail to update non-existent vendor", async function () {
        await expect(
          vendorWarsExtended.updateVendorInfo(
            user1.address,
            "nonexistent",
            "Updated Vendor",
            "Updated description",
            "Updated category",
            ethers.parseEther("2")
          )
        ).to.be.revertedWith("Vendor does not exist");
      });

      it("Should fail with empty vendor ID", async function () {
        await expect(
          vendorWarsExtended.updateVendorInfo(
            user1.address,
            "",
            "Updated Vendor",
            "Updated description",
            "Updated category",
            ethers.parseEther("2")
          )
        ).to.be.revertedWith("Vendor ID cannot be empty");
      });

      it("Should fail with insufficient balance", async function () {
        // Create a user with small balance
        const [, , , user3] = await ethers.getSigners();
        await battleToken.transfer(user3.address, ethers.parseEther("10"));
        await battleToken.connect(user3).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("10"));
        
        await expect(
          vendorWarsExtended.updateVendorInfo(
            user3.address,
            "vendor1",
            "Updated Vendor",
            "Updated description",
            "Updated category",
            ethers.parseEther("20") // More than user has
          )
        ).to.be.revertedWith("Insufficient balance");
      });
    });

    describe("verifyVendor", function () {
      it("Should verify vendor successfully", async function () {
        const tx = await vendorWarsExtended.verifyVendor(
          user1.address,
          "vendor1",
          user2.address,
          "Verification data",
          ethers.parseEther("3")
        );

        await expect(tx)
          .to.emit(vendorWarsExtended, "VendorVerified")
          .withArgs("vendor1", user2.address, "Verification data");
      });

      it("Should fail to verify non-existent vendor", async function () {
        await expect(
          vendorWarsExtended.verifyVendor(
            user1.address,
            "nonexistent",
            user2.address,
            "Verification data",
            ethers.parseEther("3")
          )
        ).to.be.revertedWith("Vendor does not exist");
      });

      it("Should fail with invalid verifier address", async function () {
        await expect(
          vendorWarsExtended.verifyVendor(
            user1.address,
            "vendor1",
            ethers.ZeroAddress,
            "Verification data",
            ethers.parseEther("3")
          )
        ).to.be.revertedWith("Invalid verifier address");
      });

      it("Should fail with insufficient balance", async function () {
        // Create a user with small balance
        const [, , , user3] = await ethers.getSigners();
        await battleToken.transfer(user3.address, ethers.parseEther("10"));
        await battleToken.connect(user3).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("10"));
        
        await expect(
          vendorWarsExtended.verifyVendor(
            user3.address,
            "vendor1",
            user2.address,
            "Verification data",
            ethers.parseEther("20") // More than user has
          )
        ).to.be.revertedWith("Insufficient balance");
      });
    });

    describe("boostVendor", function () {
      it("Should boost vendor successfully", async function () {
        const tx = await vendorWarsExtended.boostVendor(
          user1.address,
          "vendor1",
          ethers.parseEther("10"),
          3600, // 1 hour
          ethers.parseEther("5")
        );

        await expect(tx)
          .to.emit(vendorWarsExtended, "VendorBoosted")
          .withArgs(user1.address, "vendor1", ethers.parseEther("10"), 3600);
      });

      it("Should fail with insufficient balance", async function () {
        // Create a user with small balance
        const [, , , user3] = await ethers.getSigners();
        await battleToken.transfer(user3.address, ethers.parseEther("10"));
        await battleToken.connect(user3).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("10"));
        
        await expect(
          vendorWarsExtended.boostVendor(
            user3.address,
            "vendor1",
            ethers.parseEther("10"),
            3600,
            ethers.parseEther("20") // More than user has
          )
        ).to.be.revertedWith("Insufficient balance");
      });

      it("Should fail with non-existent vendor", async function () {
        await expect(
          vendorWarsExtended.boostVendor(
            user1.address,
            "nonexistent",
            ethers.parseEther("10"),
            3600,
            ethers.parseEther("5")
          )
        ).to.be.revertedWith("Vendor does not exist");
      });
    });

    describe("submitReview", function () {
      it("Should submit review successfully", async function () {
        const tx = await vendorWarsExtended.submitReview(
          user1.address,
          ethers.parseEther("5"),
          "Great vendor!",
          "review1"
        );

        await expect(tx)
          .to.emit(vendorWarsExtended, "TokensBurned")
          .withArgs(user1.address, ethers.parseEther("5"), await tx.getBlock().then(b => b.timestamp));
      });

      it("Should fail with insufficient balance", async function () {
        // Create a user with small balance
        const [, , , user3] = await ethers.getSigners();
        await battleToken.transfer(user3.address, ethers.parseEther("10"));
        await battleToken.connect(user3).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("10"));
        
        await expect(
          vendorWarsExtended.submitReview(
            user3.address,
            ethers.parseEther("20"), // More than user has
            "Great vendor!",
            "review1"
          )
        ).to.be.revertedWith("Insufficient balance");
      });

      it("Should fail with empty review ID", async function () {
        await expect(
          vendorWarsExtended.submitReview(
            user1.address,
            ethers.parseEther("5"),
            "Great vendor!",
            ""
          )
        ).to.be.revertedWith("Empty review ID");
      });
    });

    describe("recordVote", function () {
      it("Should record vote successfully", async function () {
        const tx = await vendorWarsExtended.recordVote(
          user1.address,
          ethers.parseEther("3"),
          "vendor1",
          "zone1",
          ethers.parseEther("10"),
          true
        );

        await expect(tx)
          .to.emit(vendorWarsExtended, "VoteRecorded")
          .withArgs(user1.address, "vendor1", "zone1", ethers.parseEther("10"), true);
      });

      it("Should fail with non-existent vendor", async function () {
        await expect(
          vendorWarsExtended.recordVote(
            user1.address,
            ethers.parseEther("3"),
            "nonexistent",
            "zone1",
            ethers.parseEther("10"),
            true
          )
        ).to.be.revertedWith("Vendor does not exist");
      });

      it("Should fail with insufficient balance", async function () {
        // Create a user with small balance
        const [, , , user3] = await ethers.getSigners();
        await battleToken.transfer(user3.address, ethers.parseEther("10"));
        await battleToken.connect(user3).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("10"));
        
        await expect(
          vendorWarsExtended.recordVote(
            user3.address,
            ethers.parseEther("20"), // More than user has
            "vendor1",
            "zone1",
            ethers.parseEther("10"),
            true
          )
        ).to.be.revertedWith("Insufficient balance");
      });
    });

    describe("claimTerritory", function () {
      it("Should claim territory successfully", async function () {
        const tx = await vendorWarsExtended.claimTerritory(
          user1.address,
          "zone1",
          "vendor1",
          ethers.parseEther("100"),
          ethers.parseEther("4")
        );

        await expect(tx)
          .to.emit(vendorWarsExtended, "TerritoryClaimed")
          .withArgs("zone1", "vendor1", ethers.parseEther("100"));
      });

      it("Should fail with non-existent vendor", async function () {
        await expect(
          vendorWarsExtended.claimTerritory(
            user1.address,
            "zone1",
            "nonexistent",
            ethers.parseEther("100"),
            ethers.parseEther("4")
          )
        ).to.be.revertedWith("Vendor does not exist");
      });

      it("Should fail with empty zone ID", async function () {
        await expect(
          vendorWarsExtended.claimTerritory(
            user1.address,
            "",
            "vendor1",
            ethers.parseEther("100"),
            ethers.parseEther("4")
          )
        ).to.be.revertedWith("Zone ID cannot be empty");
      });

      it("Should fail with insufficient balance", async function () {
        // Create a user with small balance
        const [, , , user3] = await ethers.getSigners();
        await battleToken.transfer(user3.address, ethers.parseEther("10"));
        await battleToken.connect(user3).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("10"));
        
        await expect(
          vendorWarsExtended.claimTerritory(
            user3.address,
            "zone1",
            "vendor1",
            ethers.parseEther("100"),
            ethers.parseEther("20") // More than user has
          )
        ).to.be.revertedWith("Insufficient balance");
      });
    });

    describe("mintAchievementNFT", function () {
      it("Should mint achievement NFT successfully", async function () {
        const tx = await vendorWarsExtended.mintAchievementNFT(
          user1.address,
          "First Vendor",
          '{"image":"ipfs://example","description":"First vendor achievement"}',
          ethers.parseEther("10")
        );

        await expect(tx)
          .to.emit(vendorWarsExtended, "AchievementNFTMinted")
          .withArgs(user1.address, 0, "First Vendor", '{"image":"ipfs://example","description":"First vendor achievement"}');

        // Check that token ID was returned
        const receipt = await tx.wait();
        const event = receipt.logs.find(log => {
          try {
            const parsed = vendorWarsExtended.interface.parseLog(log);
            return parsed.name === "AchievementNFTMinted";
          } catch {
            return false;
          }
        });
        expect(event).to.not.be.undefined;
      });

      it("Should fail with insufficient balance", async function () {
        // Create a user with small balance
        const [, , , user3] = await ethers.getSigners();
        await battleToken.transfer(user3.address, ethers.parseEther("10"));
        await battleToken.connect(user3).approve(await vendorWarsExtended.getAddress(), ethers.parseEther("10"));
        
        await expect(
          vendorWarsExtended.mintAchievementNFT(
            user3.address,
            "First Vendor",
            '{"image":"ipfs://example"}',
            ethers.parseEther("20") // More than user has
          )
        ).to.be.revertedWith("Insufficient balance");
      });

      it("Should fail with empty achievement type", async function () {
        await expect(
          vendorWarsExtended.mintAchievementNFT(
            user1.address,
            "",
            '{"image":"ipfs://example"}',
            ethers.parseEther("10")
          )
        ).to.be.revertedWith("Achievement type cannot be empty");
      });

      it("Should fail with metadata too large", async function () {
        const largeMetadata = "x".repeat(401); // Too large
        await expect(
          vendorWarsExtended.mintAchievementNFT(
            user1.address,
            "First Vendor",
            largeMetadata,
            ethers.parseEther("10")
          )
        ).to.be.revertedWith("Metadata too large");
      });
    });
  });
});