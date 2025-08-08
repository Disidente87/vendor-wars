# Palkeoramix decompiler. 
#
#  I failed with these: 
#  - unknown2a7ea9d2(?)
#  All the rest is below.
#

const decimals = 18

def storage:
  balanceOf is mapping of uint256 at storage 0
  allowance is mapping of uint256 at storage 1
  totalSupply is uint256 at storage 2
  stor3 is array of struct at storage 3
  stor4 is array of struct at storage 4
  owner is addr at storage 5
  stor6 is array of struct at storage 6
  nonces is mapping of uint256 at storage 8
  stor9 is uint256 at storage 9
  unknown4687d393 is mapping of uint256 at storage 10
  unknown96c01184 is mapping of uint256 at storage 11

def totalSupply() payable: 
  return totalSupply

def unknown4687d393(uint256 _param1) payable: 
  require calldata.size - 4 >=ΓÇ▓ 32
  require _param1 == addr(_param1)
  return unknown4687d393[_param1]

def unknown666c4b5c(uint256 _param1) payable: 
  require calldata.size - 4 >=ΓÇ▓ 32
  require _param1 == addr(_param1)
  return unknown4687d393[addr(_param1)]

def balanceOf(address _owner) payable: 
  require calldata.size - 4 >=ΓÇ▓ 32
  require _owner == _owner
  return balanceOf[addr(_owner)]

def nonces(address _param1) payable: 
  require calldata.size - 4 >=ΓÇ▓ 32
  require _param1 == _param1
  return nonces[addr(_param1)]

def owner() payable: 
  return owner

def unknown96c01184(array _param1) payable: 
  require calldata.size - 4 >=ΓÇ▓ 32
  require _param1 <= 18446744073709551615
  require _param1 + 35 <ΓÇ▓ calldata.size
  if _param1.length > 18446744073709551615:
      revert with 0, 65
  if ceil32(ceil32(_param1.length)) + 97 < 96 or ceil32(ceil32(_param1.length)) + 97 > 18446744073709551615:
      revert with 0, 65
  require _param1 + _param1.length + 36 <= calldata.size
  return unknown96c01184[_param1[all]]

def allowance(address _owner, address _spender) payable: 
  require calldata.size - 4 >=ΓÇ▓ 64
  require _owner == _owner
  require _spender == _spender
  return allowance[addr(_owner)][addr(_spender)]

#
#  Regular functions
#

def _fallback() payable: # default function
  revert

def renounceOwnership() payable: 
  if owner != caller:
      revert with 0, caller
  owner = 0
  log OwnershipTransferred(
        address previousOwner=owner,
        address newOwner=0)

def unknowndfe6b5d6() payable: 
  if -balanceOf[stor5] + 21000000 * 10^18 > 21000000 * 10^18:
      revert with 0, 17
  return totalSupply, balanceOf[stor5], -balanceOf[stor5] + 21000000 * 10^18

def transferOwnership(address _newOwner) payable: 
  require calldata.size - 4 >=ΓÇ▓ 32
  require _newOwner == _newOwner
  if owner != caller:
      revert with 0, caller
  require _newOwner
  owner = _newOwner
  log OwnershipTransferred(
        address previousOwner=owner,
        address newOwner=_newOwner)

def burn(uint256 _value) payable: 
  require calldata.size - 4 >=ΓÇ▓ 32
  require caller
  if balanceOf[caller] < _value:
      revert with 0, caller, balanceOf[caller], _value
  balanceOf[caller] -= _value
  totalSupply -= _value
  log Transfer(
        address from=_value,
        address to=caller,
        uint256 tokens=0)

def approve(address _spender, uint256 _value) payable: 
  require calldata.size - 4 >=ΓÇ▓ 64
  require _spender == _spender
  require caller
  require _spender
  allowance[caller][addr(_spender)] = _value
  log Approval(
        address tokenOwner=_value,
        address spender=caller,
        uint256 tokens=_spender)
  return 1

def DOMAIN_SEPARATOR() payable: 
  if this.address != 0xda6884d4f2e68b9700678139b617607560f70cc3:
      return sha3(0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f, 0x3bf12c21002f5d9fa8d591520201e0bc38009aabda1e9b546543fb345b45eb0c, 0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6, chainid, this.address)
  if 84532 != chainid:
      return sha3(0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f, 0x3bf12c21002f5d9fa8d591520201e0bc38009aabda1e9b546543fb345b45eb0c, 0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6, chainid, this.address)
  return 0xd000cef7700437b93162b8a67687ecd3e195d618c14c7912d1eaa353ad4fe981

def mint(address _to, uint256 _amount) payable: 
  require calldata.size - 4 >=ΓÇ▓ 64
  require _to == _to
  if owner != caller:
      revert with 0, caller
  if not _to:
      revert with 0, 'Invalid recipient'
  if _amount <= 0:
      revert with 0, 'Amount must be greater than 0'
  require _to
  if totalSupply > _amount + totalSupply:
      revert with 0, 17
  totalSupply += _amount
  if _to:
      balanceOf[addr(_to)] += _amount
  else:
      totalSupply -= _amount
  log Transfer(
        address from=_amount,
        address to=0,
        uint256 tokens=_to)

def transfer(address _to, uint256 _value) payable: 
  require calldata.size - 4 >=ΓÇ▓ 64
  require _to == _to
  require caller
  require _to
  if caller:
      if balanceOf[caller] < _value:
          revert with 0, caller, balanceOf[caller], _value
      balanceOf[caller] -= _value
  else:
      if totalSupply > _value + totalSupply:
          revert with 0, 17
      totalSupply += _value
  if _to:
      balanceOf[addr(_to)] += _value
  else:
      totalSupply -= _value
  log Transfer(
        address from=_value,
        address to=caller,
        uint256 tokens=_to)
  return 1

def burnFrom(address _from, uint256 _value) payable: 
  require calldata.size - 4 >=ΓÇ▓ 64
  require _from == _from
  if allowance[addr(_from)][caller] < -1:
      if allowance[addr(_from)][caller] < _value:
          revert with 0, caller, allowance[addr(_from)][caller], _value
      require _from
      require caller
      allowance[addr(_from)][caller] -= _value
  require _from
  if balanceOf[addr(_from)] < _value:
      revert with 0, addr(_from), balanceOf[addr(_from)], _value
  balanceOf[addr(_from)] -= _value
  totalSupply -= _value
  log Transfer(
        address from=_value,
        address to=_from,
        uint256 tokens=0)

def unknown5e43c09a(array _param1) payable: 
  require calldata.size - 4 >=ΓÇ▓ 32
  require _param1 <= 18446744073709551615
  require _param1 + 35 <ΓÇ▓ calldata.size
  if _param1.length > 18446744073709551615:
      revert with 0, 65
  if ceil32(ceil32(_param1.length)) + 97 < 96 or ceil32(ceil32(_param1.length)) + 97 > 18446744073709551615:
      revert with 0, 65
  mem[96] = _param1.length
  require _param1 + _param1.length + 36 <= calldata.size
  mem[128 len _param1.length] = _param1[all]
  mem[_param1.length + 128] = 0
  mem[ceil32(ceil32(_param1.length)) + 97 len ceil32(_param1.length)] = _param1[all], mem[_param1.length + 128 len ceil32(_param1.length) - _param1.length]
  mem[_param1.length + ceil32(ceil32(_param1.length)) + 97] = 11
  mem[ceil32(ceil32(_param1.length)) + 97] = stor[sha3(mem[ceil32(ceil32(_param1.length)) + 97 len _param1.length + 32])]
  return memory
    from ceil32(ceil32(_param1.length)) + 97
     len 32

def emergencyWithdraw() payable: 
  if owner != caller:
      revert with 0, caller
  if not stor9 - 2:
      revert with 1055239861
  stor9 = 2
  if balanceOf[this.address]:
      require this.address
      require owner
      if this.address:
          if balanceOf[addr(this.address)] < balanceOf[this.address]:
              revert with 0, addr(this.address), balanceOf[addr(this.address)], balanceOf[this.address]
          balanceOf[addr(this.address)] -= balanceOf[this.address]
      else:
          if totalSupply > balanceOf[this.address] + totalSupply:
              revert with 0, 17
          totalSupply += balanceOf[this.address]
      if owner:
          balanceOf[stor5] += balanceOf[this.address]
      else:
          totalSupply -= balanceOf[this.address]
      log Transfer(
            address from=balanceOf[this.address],
            address to=this.address,
            uint256 tokens=owner)
  stor9 = 1

def transferFrom(address _from, address _to, uint256 _value) payable: 
  require calldata.size - 4 >=ΓÇ▓ 96
  require _from == _from
  require _to == _to
  if allowance[addr(_from)][caller] < -1:
      if allowance[addr(_from)][caller] < _value:
          revert with 0, caller, allowance[addr(_from)][caller], _value
      require _from
      require caller
      allowance[addr(_from)][caller] -= _value
  require _from
  require _to
  if _from:
      if balanceOf[addr(_from)] < _value:
          revert with 0, addr(_from), balanceOf[addr(_from)], _value
      balanceOf[addr(_from)] -= _value
  else:
      if totalSupply > _value + totalSupply:
          revert with 0, 17
      totalSupply += _value
  if _to:
      balanceOf[addr(_to)] += _value
  else:
      totalSupply -= _value
  log Transfer(
        address from=_value,
        address to=_from,
        uint256 tokens=_to)
  return 1

def unknownd505accf(uint256 _param1, uint256 _param2, uint256 _param3, uint256 _param4, uint256 _param5, uint256 _param6, uint256 _param7) payable: 
  require calldata.size - 4 >=ΓÇ▓ 224
  require _param1 == addr(_param1)
  require _param2 == addr(_param2)
  require _param5 == uint8(_param5)
  if block.timestamp > _param4:
      revert with 0, _param4
  nonces[addr(_param1)]++
  if _param7 > 0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0:
      revert with 0, _param7
  if this.address != 0xda6884d4f2e68b9700678139b617607560f70cc3:
      signer = erecover(sha3(6401, sha3(0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f, 0x3bf12c21002f5d9fa8d591520201e0bc38009aabda1e9b546543fb345b45eb0c, 0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6, chainid, this.address), sha3(0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9, addr(_param1), addr(_param2), _param3, nonces[addr(_param1)], _param4)), _param5 << 248, _param6, _param7) # precompiled
  else:
      if 84532 != chainid:
          signer = erecover(sha3(6401, sha3(0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f, 0x3bf12c21002f5d9fa8d591520201e0bc38009aabda1e9b546543fb345b45eb0c, 0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6, chainid, this.address), sha3(0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9, addr(_param1), addr(_param2), _param3, nonces[addr(_param1)], _param4)), _param5 << 248, _param6, _param7) # precompiled
      else:
          signer = erecover(sha3(6401, 0xd000cef7700437b93162b8a67687ecd3e195d618c14c7912d1eaa353ad4fe981, sha3(0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9, addr(_param1), addr(_param2), _param3, nonces[addr(_param1)], _param4)), _param5 << 248, _param6, _param7) # precompiled
  if not erecover.result:
      revert with ext_call.return_data[0 len return_data.size]
  if not addr(signer):
      revert with 4131778271
  if addr(signer) != addr(_param1):
      revert with 0, addr(signer), addr(_param1)
  require addr(_param1)
  require addr(_param2)
  allowance[addr(_param1)][addr(_param2)] = _param3
  log Approval(
        address tokenOwner=_param3,
        address spender=addr(_param1),
        uint256 tokens=addr(_param2))

def name() payable: 
  if bool(stor3.length):
      if not bool(stor3.length) - (uint255(stor3.length) * 0.5 < 32):
          revert with 0, 34
      if bool(stor3.length):
          if not bool(stor3.length) - (uint255(stor3.length) * 0.5 < 32):
              revert with 0, 34
          if Mask(256, -1, stor3.length):
              if 31 < uint255(stor3.length) * 0.5:
                  mem[128] = uint256(stor3.field_0)
                  idx = 128
                  s = 0
                  while (uint255(stor3.length) * 0.5) + 96 > idx:
                      mem[idx + 32] = stor3[s].field_256
                      idx = idx + 32
                      s = s + 1
                      continue 
                  return Array(len=2 * Mask(256, -1, stor3.length), data=mem[128 len ceil32(uint255(stor3.length) * 0.5)])
              mem[128] = 256 * Mask(248, 0, stor3.length.field_8)
      else:
          if not bool(stor3.length) - (stor3.length.field_1 % 128 < 32):
              revert with 0, 34
          if stor3.length.field_1 % 128:
              if 31 < stor3.length.field_1 % 128:
                  mem[128] = uint256(stor3.field_0)
                  idx = 128
                  s = 0
                  while stor3.length.field_1 % 128 + 96 > idx:
                      mem[idx + 32] = stor3[s].field_256
                      idx = idx + 32
                      s = s + 1
                      continue 
                  return Array(len=2 * Mask(256, -1, stor3.length), data=mem[128 len ceil32(uint255(stor3.length) * 0.5)])
              mem[128] = 256 * Mask(248, 0, stor3.length.field_8)
      mem[ceil32(uint255(stor3.length) * 0.5) + 192 len ceil32(uint255(stor3.length) * 0.5)] = mem[128 len ceil32(uint255(stor3.length) * 0.5)]
      mem[(uint255(stor3.length) * 0.5) + ceil32(uint255(stor3.length) * 0.5) + 192] = 0
      return Array(len=2 * Mask(256, -1, stor3.length), data=mem[128 len ceil32(uint255(stor3.length) * 0.5)], mem[(2 * ceil32(uint255(stor3.length) * 0.5)) + 192 len 2 * ceil32(uint255(stor3.length) * 0.5)]), 
  if not bool(stor3.length) - (stor3.length.field_1 % 128 < 32):
      revert with 0, 34
  if bool(stor3.length):
      if not bool(stor3.length) - (uint255(stor3.length) * 0.5 < 32):
          revert with 0, 34
      if Mask(256, -1, stor3.length):
          if 31 < uint255(stor3.length) * 0.5:
              mem[128] = uint256(stor3.field_0)
              idx = 128
              s = 0
              while (uint255(stor3.length) * 0.5) + 96 > idx:
                  mem[idx + 32] = stor3[s].field_256
                  idx = idx + 32
                  s = s + 1
                  continue 
              return Array(len=stor3.length % 128, data=mem[128 len ceil32(stor3.length.field_1 % 128)])
          mem[128] = 256 * Mask(248, 0, stor3.length.field_8)
  else:
      if not bool(stor3.length) - (stor3.length.field_1 % 128 < 32):
          revert with 0, 34
      if stor3.length.field_1 % 128:
          if 31 < stor3.length.field_1 % 128:
              mem[128] = uint256(stor3.field_0)
              idx = 128
              s = 0
              while stor3.length.field_1 % 128 + 96 > idx:
                  mem[idx + 32] = stor3[s].field_256
                  idx = idx + 32
                  s = s + 1
                  continue 
              return Array(len=stor3.length % 128, data=mem[128 len ceil32(stor3.length.field_1 % 128)])
          mem[128] = 256 * Mask(248, 0, stor3.length.field_8)
  mem[ceil32(stor3.length.field_1 % 128) + 192 len ceil32(stor3.length.field_1 % 128)] = mem[128 len ceil32(stor3.length.field_1 % 128)]
  mem[stor3.length.field_1 % 128 + ceil32(stor3.length.field_1 % 128) + 192] = 0
  return Array(len=stor3.length % 128, data=mem[128 len ceil32(stor3.length.field_1 % 128)], mem[(2 * ceil32(stor3.length.field_1 % 128)) + 192 len 2 * ceil32(stor3.length.field_1 % 128)]), 

def symbol() payable: 
  if bool(stor4.length):
      if not bool(stor4.length) - (uint255(stor4.length) * 0.5 < 32):
          revert with 0, 34
      if bool(stor4.length):
          if not bool(stor4.length) - (uint255(stor4.length) * 0.5 < 32):
              revert with 0, 34
          if Mask(256, -1, stor4.length):
              if 31 < uint255(stor4.length) * 0.5:
                  mem[128] = uint256(stor4.field_0)
                  idx = 128
                  s = 0
                  while (uint255(stor4.length) * 0.5) + 96 > idx:
                      mem[idx + 32] = stor4[s].field_256
                      idx = idx + 32
                      s = s + 1
                      continue 
                  return Array(len=2 * Mask(256, -1, stor4.length), data=mem[128 len ceil32(uint255(stor4.length) * 0.5)])
              mem[128] = 256 * Mask(248, 0, stor4.length.field_8)
      else:
          if not bool(stor4.length) - (stor4.length.field_1 % 128 < 32):
              revert with 0, 34
          if stor4.length.field_1 % 128:
              if 31 < stor4.length.field_1 % 128:
                  mem[128] = uint256(stor4.field_0)
                  idx = 128
                  s = 0
                  while stor4.length.field_1 % 128 + 96 > idx:
                      mem[idx + 32] = stor4[s].field_256
                      idx = idx + 32
                      s = s + 1
                      continue 
                  return Array(len=2 * Mask(256, -1, stor4.length), data=mem[128 len ceil32(uint255(stor4.length) * 0.5)])
              mem[128] = 256 * Mask(248, 0, stor4.length.field_8)
      mem[ceil32(uint255(stor4.length) * 0.5) + 192 len ceil32(uint255(stor4.length) * 0.5)] = mem[128 len ceil32(uint255(stor4.length) * 0.5)]
      mem[(uint255(stor4.length) * 0.5) + ceil32(uint255(stor4.length) * 0.5) + 192] = 0
      return Array(len=2 * Mask(256, -1, stor4.length), data=mem[128 len ceil32(uint255(stor4.length) * 0.5)], mem[(2 * ceil32(uint255(stor4.length) * 0.5)) + 192 len 2 * ceil32(uint255(stor4.length) * 0.5)]), 
  if not bool(stor4.length) - (stor4.length.field_1 % 128 < 32):
      revert with 0, 34
  if bool(stor4.length):
      if not bool(stor4.length) - (uint255(stor4.length) * 0.5 < 32):
          revert with 0, 34
      if Mask(256, -1, stor4.length):
          if 31 < uint255(stor4.length) * 0.5:
              mem[128] = uint256(stor4.field_0)
              idx = 128
              s = 0
              while (uint255(stor4.length) * 0.5) + 96 > idx:
                  mem[idx + 32] = stor4[s].field_256
                  idx = idx + 32
                  s = s + 1
                  continue 
              return Array(len=stor4.length % 128, data=mem[128 len ceil32(stor4.length.field_1 % 128)])
          mem[128] = 256 * Mask(248, 0, stor4.length.field_8)
  else:
      if not bool(stor4.length) - (stor4.length.field_1 % 128 < 32):
          revert with 0, 34
      if stor4.length.field_1 % 128:
          if 31 < stor4.length.field_1 % 128:
              mem[128] = uint256(stor4.field_0)
              idx = 128
              s = 0
              while stor4.length.field_1 % 128 + 96 > idx:
                  mem[idx + 32] = stor4[s].field_256
                  idx = idx + 32
                  s = s + 1
                  continue 
              return Array(len=stor4.length % 128, data=mem[128 len ceil32(stor4.length.field_1 % 128)])
          mem[128] = 256 * Mask(248, 0, stor4.length.field_8)
  mem[ceil32(stor4.length.field_1 % 128) + 192 len ceil32(stor4.length.field_1 % 128)] = mem[128 len ceil32(stor4.length.field_1 % 128)]
  mem[stor4.length.field_1 % 128 + ceil32(stor4.length.field_1 % 128) + 192] = 0
  return Array(len=stor4.length % 128, data=mem[128 len ceil32(stor4.length.field_1 % 128)], mem[(2 * ceil32(stor4.length.field_1 % 128)) + 192 len 2 * ceil32(stor4.length.field_1 % 128)]), 

def unknown84b0196e() payable: 
  if 'Battle Token' == 255:
      if bool(stor6.length):
          if not bool(stor6.length) - (uint255(stor6.length) * 0.5 < 32):
              revert with 0, 34
          if bool(stor6.length):
              if not bool(stor6.length) - (uint255(stor6.length) * 0.5 < 32):
                  revert with 0, 34
              if Mask(256, -1, stor6.length):
                  if 31 >= uint255(stor6.length) * 0.5:
                      mem[128] = 256 * Mask(248, 0, stor6.length.field_8)
                  else:
                      mem[128] = uint256(stor6.field_0)
                      idx = 128
                      s = 0
                      while (uint255(stor6.length) * 0.5) + 96 > idx:
                          mem[idx + 32] = stor6[s].field_256
                          idx = idx + 32
                          s = s + 1
                          continue 
          else:
              if not bool(stor6.length) - (stor6.length.field_1 % 128 < 32):
                  revert with 0, 34
              if stor6.length.field_1 % 128:
                  if 31 >= stor6.length.field_1 % 128:
                      mem[128] = 256 * Mask(248, 0, stor6.length.field_8)
                  else:
                      mem[128] = uint256(stor6.field_0)
                      idx = 128
                      s = 0
                      while stor6.length.field_1 % 128 + 96 > idx:
                          mem[idx + 32] = stor6[s].field_256
                          idx = idx + 32
                          s = s + 1
                          continue 
          return 0xf00000000000000000000000000000000000000000000000000000000000000, 
                 224,
                 ceil32(uint255(stor6.length) * 0.5) + 256,
                 chainid,
                 addr(this.address),
                 0,
                 ceil32(uint255(stor6.length) * 0.5) + 320,
                 2 * Mask(256, -1, stor6.length),
                 mem[128 len ceil32(uint255(stor6.length) * 0.5)],
                 1,
                 0,
                 0,
                 0
      if not bool(stor6.length) - (stor6.length.field_1 % 128 < 32):
          revert with 0, 34
      if bool(stor6.length):
          if not bool(stor6.length) - (uint255(stor6.length) * 0.5 < 32):
              revert with 0, 34
          if not Mask(256, -1, stor6.length):
              return 0xf00000000000000000000000000000000000000000000000000000000000000, 
                     224,
                     ceil32(stor6.length.field_1 % 128) + 256,
                     chainid,
                     addr(this.address),
                     0,
                     ceil32(stor6.length.field_1 % 128) + 320,
                     stor6.length % 128,
                     mem[128 len ceil32(stor6.length.field_1 % 128)],
                     1,
                     0,
                     0,
                     0,
                     None
          if 31 >= uint255(stor6.length) * 0.5:
              mem[128] = 256 * Mask(248, 0, stor6.length.field_8)
              return 0xf00000000000000000000000000000000000000000000000000000000000000, 
                     224,
                     ceil32(stor6.length.field_1 % 128) + 256,
                     chainid,
                     addr(this.address),
                     0,
                     ceil32(stor6.length.field_1 % 128) + 320,
                     stor6.length % 128,
                     mem[128 len ceil32(stor6.length.field_1 % 128)],
                     1,
                     0,
                     0,
                     0,
                     None
          mem[128] = uint256(stor6.field_0)
          idx = 128
          s = 0
          while (uint255(stor6.length) * 0.5) + 96 > idx:
              mem[idx + 32] = stor6[s].field_256
              idx = idx + 32
              s = s + 1
              continue 
      else:
          if not bool(stor6.length) - (stor6.length.field_1 % 128 < 32):
              revert with 0, 34
          if not stor6.length.field_1 % 128:
              return 0xf00000000000000000000000000000000000000000000000000000000000000, 
                     224,
                     ceil32(stor6.length.field_1 % 128) + 256,
                     chainid,
                     addr(this.address),
                     0,
                     ceil32(stor6.length.field_1 % 128) + 320,
                     stor6.length % 128,
                     mem[128 len ceil32(stor6.length.field_1 % 128)],
                     1,
                     0,
                     0,
                     0,
                     None
          if 31 >= stor6.length.field_1 % 128:
              mem[128] = 256 * Mask(248, 0, stor6.length.field_8)
              return 0xf00000000000000000000000000000000000000000000000000000000000000, 
                     224,
                     ceil32(stor6.length.field_1 % 128) + 256,
                     chainid,
                     addr(this.address),
                     0,
                     ceil32(stor6.length.field_1 % 128) + 320,
                     stor6.length % 128,
                     mem[128 len ceil32(stor6.length.field_1 % 128)],
                     1,
                     0,
                     0,
                     0,
                     None
          mem[128] = uint256(stor6.field_0)
          idx = 128
          s = 0
          while stor6.length.field_1 % 128 + 96 > idx:
              mem[idx + 32] = stor6[s].field_256
              idx = idx + 32
              s = s + 1
              continue 
      return 0xf00000000000000000000000000000000000000000000000000000000000000, 
             224,
             ceil32(stor6.length.field_1 % 128) + 256,
             chainid,
             addr(this.address),
             0,
             ceil32(stor6.length.field_1 % 128) + 320,
             stor6.length % 128,
             mem[128 len ceil32(stor6.length.field_1 % 128)],
             1,
             0,
             0,
             0
  if uint8('Battle Token') > 31:
      revert with 3008441100
  mem[128] = 'Battle Token'
  mem[160] = 1
  mem[192] = 0x3100000000000000000000000000000000000000000000000000000000000001
  mem[224] = 0
  mem[256] = 0xf00000000000000000000000000000000000000000000000000000000000000
  mem[288] = 224
  mem[ceil32(uint8('Battle Token')) + 512] = 1
  return 0xf00000000000000000000000000000000000000000000000000000000000000, 
         224,
         ceil32(uint8('Battle Token')) + 256,
         chainid,
         addr(this.address),
         0,
         ceil32(uint8('Battle Token')) + 320,
         'Battle Token' << 248,
         mem[128 len ceil32(uint8('Battle Token'))],
         Mask(8 * -ceil32(uint8('Battle Token')) + uint8('Battle Token') + 32, 0, 0),
         mem[uint8('Battle Token') + 544 len -uint8('Battle Token') + ceil32(uint8('Battle Token'))],
         0,
         0,
         0

def unknown8df456fb() payable: 
  require calldata.size - 4 >=ΓÇ▓ 96
  require cd <= 18446744073709551615
  require cd <ΓÇ▓ calldata.size
  if ('cd', 4).length > 18446744073709551615:
      revert with 0, 65
  if ceil32(32 * ('cd', 4).length) + 97 < 96 or ceil32(32 * ('cd', 4).length) + 97 > 18446744073709551615:
      revert with 0, 65
  mem[96] = ('cd', 4).length
  require cd * ('cd', 4).length) + 36 <= calldata.size
  s = 128
  idx = cd[4] + 36
  while idx < cd * ('cd', 4).length) + 36:
      require cd[idx] == addr(cd[idx])
      mem[s] = cd[idx]
      s = s + 32
      idx = idx + 32
      continue 
  require cd <= 18446744073709551615
  require cd <ΓÇ▓ calldata.size
  if ('cd', 36).length > 18446744073709551615:
      revert with 0, 65
  if ceil32(32 * ('cd', 36).length) + 98 < 97 or ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98 > 18446744073709551615:
      revert with 0, 65
  mem[ceil32(32 * ('cd', 4).length) + 97] = ('cd', 36).length
  require cd * ('cd', 36).length) + 36 <= calldata.size
  idx = cd[36] + 36
  s = ceil32(32 * ('cd', 4).length) + 129
  while idx < cd * ('cd', 36).length) + 36:
      mem[s] = cd[idx]
      idx = idx + 32
      s = s + 32
      continue 
  require cd <= 18446744073709551615
  require cd <ΓÇ▓ calldata.size
  if ('cd', 68).length > 18446744073709551615:
      revert with 0, 65
  if ceil32(ceil32(('cd', 68).length)) + 99 < 98 or ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99 > 18446744073709551615:
      revert with 0, 65
  mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98] = ('cd', 68).length
  require cd('cd', 68).length + 36 <= calldata.size
  mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 130 len ('cd', 68).length] = call.data[cd('cd', 68).length]
  mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ('cd', 68).length + 130] = 0
  if owner != caller:
      revert with 0, caller
  if not stor9 - 2:
      revert with 1055239861
  stor9 = 2
  if ('cd', 4).length != ('cd', 36).length:
      revert with 0, 'Arrays length mismatch'
  if ('cd', 4).length > 100:
      revert with 0, 'Too many recipients'
  idx = 0
  s = 0
  while idx < ('cd', 4).length:
      if idx >= ('cd', 4).length:
          revert with 0, 50
      if not mem[(32 * idx) + 140 len 20]:
          revert with 0, 'Invalid recipient'
      if idx >= ('cd', 36).length:
          revert with 0, 50
      if mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129] <= 0:
          revert with 0, 'Amount must be greater than 0'
      if idx >= ('cd', 36).length:
          revert with 0, 50
      if s > mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129] + s:
          revert with 0, 17
      if not idx + 1:
          revert with 0, 17
      idx = idx + 1
      s = mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129] + s
      continue 
  if balanceOf[stor5] < mem[(32 * ('cd', 4).length) + ceil32(32 * ('cd', 4).length) + 129] * ('cd', 4).length:
      revert with 0, 'Insufficient balance'
  idx = 0
  while idx < ('cd', 4).length:
      if idx >= mem[96]:
          revert with 0, 50
      _312 = mem[(32 * idx) + 128]
      if idx >= mem[ceil32(32 * ('cd', 4).length) + 97]:
          revert with 0, 50
      _314 = mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
      require owner
      require mem[(32 * idx) + 140 len 20]
      if owner:
          if balanceOf[stor5] < mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]:
              revert with 0, owner, balanceOf[stor5], mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
          balanceOf[stor5] -= mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
          if mem[(32 * idx) + 140 len 20]:
              balanceOf[addr(mem[(32 * idx) + 128])] += mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
          else:
              totalSupply -= mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
          mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99] = mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
          log Transfer(
                address from=_314,
                address to=owner,
                uint256 tokens=addr(_312))
      else:
          if totalSupply > mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129] + totalSupply:
              revert with 0, 17
          totalSupply += mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
          if mem[(32 * idx) + 140 len 20]:
              balanceOf[mem[(32 * idx) + 140 len 20]] += mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
              mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99] = mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
              log Transfer(
                    address from=_314,
                    address to=owner,
                    uint256 tokens=addr(_312))
          else:
              totalSupply -= mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
              mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99] = mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
              log Transfer(
                    address from=mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99],
                    address to=owner,
                    uint256 tokens=addr(_312))
      if idx >= mem[ceil32(32 * ('cd', 4).length) + 97]:
          revert with 0, 50
      if idx >= mem[96]:
          revert with 0, 50
      mem[0] = mem[(32 * idx) + 140 len 20]
      mem[32] = 10
      if unknown4687d393[mem[(32 * idx) + 140 len 20]] > mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129] + unknown4687d393[mem[(32 * idx) + 140 len 20]]:
          revert with 0, 17
      unknown4687d393[mem[(32 * idx) + 140 len 20]] += mem[(32 * idx) + ceil32(32 * ('cd', 4).length) + 129]
      if not idx + 1:
          revert with 0, 17
      idx = idx + 1
      continue 
  _310 = mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98]
  mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99 len ceil32(mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98])] = mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 130 len ceil32(mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98])]
  idx = ceil32(_310)
  mem[_310 + ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99] = 11
  if stor[sha3(mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99 len _310 + 32])] > s + stor[sha3(mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99 len _310 + 32])]:
      revert with 0, 17
  stor[sha3(mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99 len _310 + 32])] += s
  mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99] = mem[96]
  mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 131] = s
  mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 163] = 96
  mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 195] = mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98]
  mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 227 len ceil32(mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98])] = mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 130 len ceil32(mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98])]
  mem[mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98] + ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 227] = 0
  log 0x38fcc1b8: mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 99], s, Array(len=mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98], data=mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + ceil32(ceil32(('cd', 68).length)) + 227 len ceil32(mem[ceil32(32 * ('cd', 4).length) + ceil32(32 * ('cd', 36).length) + 98])])
  stor9 = 1


