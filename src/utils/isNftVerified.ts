import { ImmutableObject } from '@hookstate/core'
import { Address } from 'ton-core'
import { NftItem } from 'tonapi-sdk-js'

const verifiedCollections = [
  'EQAOQdwdw8kGftJCSFgOErM1mBjYPe4DBPq8-AhF6vr9si5N',
  'EQANbofDSz73L5dyo_YfOHiPYYdzsc_leipQutmXzQ75qDhY',
  'EQAA1yvDaDwEK5vHGOXRdtS2MbOVd1-TNy01L1S_t2HF4oLu',
  'EQC5RIVNDIX2pw-LHugckLEv82s9SpT7f-n-PnrQaCxcDQM6',
  'EQDvRFMYLdxmvY3Tk-cfWMLqDnXF_EclO2Fp4wwj33WhlNFT',
  'EQDuMP4POEuF_bvn7AS_a7E4unNgCga0HzabpnbwC5KIomOi',
  'EQCg4sLyX-Hs6JoR44Gg5SdwKT0DHLiEC7dm7IVKmBS4ADWv',
  'EQCzuSjkgUND61l7gIH3NvVWNtZ0RX1hxz1rWnmJqGPmZh7S',
  'EQBUPA23G7Zr__ZaDLx_mMxgWne71Ae8ACGxPl8FIwPV_mAj',
  'EQBdLhLULt1DV_zojF8asYNQQ57AjByomcGCj0KuJ_xGkwdB',
  'EQDgZmQpDJbO6laHvvibaXYXMlEAYEH6LnUtA5J19W18dENp',
  'EQBwATR_oKxj7i3i_8WkkqKJQ3IrdO4lw0tSILPV_TDt6-De',
  'EQB8D8A9OoDoRmL7qVbUBrd_po9vNKcl44HCSw6b-c3nvcj9',
  'EQAzkaVZCp62HBz8KveKM0n_ju8Z2TTbDKHrEipSEVvXJ58Z',
  'EQD8OwlbQe5DjQFE5ydlemo74gey_02V8mh0KJ6Cwm_YNcrI',
  'EQBokIuCtOequcG47MnwrNm9-U_mLsYlchIL2f4olqIvN0W5',
  'EQA63JHaG-ufF4ewKtkV-9DMGNsDSMD8SCOggBbFNGcM0C52',
  'EQBibSZPEVHWHhUALDTW4y5NDNcC7HPS-BRgv9dAAsZQjh2E',
  'EQAG2BH0JlmFkbMrLEnyn2bIITaOSssd4WdisE4BdFMkZbir',
  'EQDWDzKXjvywLyRVd_hrSbu35QssPhsevj1vZQOTxcYcybAE',
  'EQCoPMFxArXwkKO9zH6IU-ZJ0ahFU2nih9rPvN7_YWcxRmhb',
  'EQC3dNlesgVD8YbAazcauIrXBPfiVhMMr5YYk2in0Mtsz0Bz',
  'EQAl_hUCAeEv-fKtGxYtITAS6PPxuMRaQwHj0QAHeWe6ZSD0',
  'EQCOFH9JGSQt8aTxVjKB0hONs0sr-QHotcH6d3AVc7rQUb8v',
  'EQADKzyAsGOmIrCn-FigjBkBrmrDEyyGaKikL5OuA1hCLkk6',
  'EQD3Ho_9KoqjSmNzfKorctLvTVabn9U_BqnjIPq17SlLs_9H',
  'EQCvYf5W36a0zQrS_wc6PMKg6JnyTcFU56NPx1PrAW63qpvt',
  'EQCiIo3KahOhEDA-Why9p3siTmNXMDLcfLz4DckLh1iV35IK',
  'EQCg2iAv486UTCHN9PCwjpRKrUoFvJDs28bcQGCbtCgQIIFd',
  'EQAo92DYMokxghKcq-CkCGSk_MgXY5Fo1SPW20gkvZl75iCN',
  'EQCdVlYKvCuUaVIWjwlGtQgWvDa8DsbCNEM6hHevSW__-07R',
  'EQBAUKszLl3K1pQ0bDX_ftjRJWmlTdLPoZ1l5X2bMIaqGH9i',
  'EQArIPSPPwOwBEg5uR8ifVGJxZJ4J1WuXKIoGVMZFcClD97j',
  'EQBpBsShOF1EvuX3nOKwNuzr5YWlJjdpCH_2n8ybizF479Tg',
  'EQAVGhk_3rUA3ypZAZ1SkVGZIaDt7UdvwA4jsSGRKRo-MRDN',
  'EQDahyr_gPkHBPbhyrvjoHGVFGGj8vXXtL7w14AV3S2JvpTF',
  'EQCwsW0Vkg-ayvgsI7Km04WBg7c-14e0GpxUIMkxg6cD-hFd',
  'EQCbZvQ-B39aNw2V3oQG6LEkgstf6y6EP4lwhVzkvFcJw6zy',
  'EQCe204kl9m1MIj5R48p7PD8Ms8UyKm8vTWtGPB4aODPBpmD',
  'EQBWg1q9Le4x4_fzrJ66Lmw75wCowni16eu1L9yYbvmVRp5Z',
  'EQC6DNFiSQzkpAucymPb9tb9MWL1Sywf_JaiAixyIncx0Oxn',
  'EQBqWhrmYDyksN0arY3FPADBenfh3d7lAYrhS52iMa5zVsHH',
  'EQCvG5k5id39xSG8FPONaPatjEBXB2Ln56579UA4FFj8e6hF',
  'EQBpOQjo6uIpkH-GqJ1oObqVjyATQEJ1PnIrM_52f3nSE_rb',
  'EQDaB2erxLK_6_FEkjpQPvNtE6jcVaIe67MnbhokV8mmF5cv',
  'EQBRh_n88N7c_LLO8et2QX92wJHLhJvDuiKKgk9L5cyDCiqa',
  'EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi',
  'EQAOQdwdw8kGftJCSFgOErM1mBjYPe4DBPq8-AhF6vr9si5N',
  'EQBpMhoMDsN0DjQZXFFBup7l5gbt-UtMzTHN5qaqQtc90CLD',
  'EQCcxO3ODgHDHwWjHvwtrXW6doPEYNaRdIefoMSqQIwG9Nor',
  'EQDXzeGLpGCM82E7oIVJVu7us7Aw-dgUt7AqoJy5bOTDMdYr',
  'EQAv34EhRpc6hSzYpysGYVWbnmKhOtl3C8m2aeXsO-wiXhD3',
  'EQBIm7aygPzln2dWAfSqY1N0uG8I3GUnZtJqwjkXXxcgAv0s',
  'EQCjYBDIcRV_XPc9cJE33lZh8l_9g0CKiteT0hbZ55uVwpUJ',
  'EQCIfaWrIerfnnibTybVpajZKl6GCsPCMJZQYYCf1FC41Xpy',
  'EQDFvR_DqLVmnt-ARUHM1qT4fAXeZE2IMN2b-VT31dlmUNOE',
  'EQBw9-_AeUeq7cqRRmm3x3wA_65qW1fWlB4JYb8nXOGn5ofa',
  'EQB_0TzCmaiIWocJIciUQC1svyZaCqK7AtlqgzLjl8NQfB3b',
  'EQCtYm3vzzef1t_D-qChCWxF5HagWpFP2mxZoBp7vttD3Llt',
  'EQCBRCly4M7rO87kvBJvSuZnsyATF3kO-r6lAkQYfV7J9MfP',
  'EQA8Zcpie_sfesbuOds9-7xUkAyJudSUhtdo2Uicp588KT66',
  'EQAVhQlmaY8AlkQWsIezwpFfuC__0BEGay-fXhXhCo3jjm-6',
  'EQDVed-1XMwASZwXCVOOw7RsMda_QiAv1Pe71fnldydb1mUO',
  'EQCQozrcb_YilvNyxd3vu39EbJMvY14bek9T-m-RLJPcmvdY',
  'EQAt7gL7w89UQA8N3Vi_dP-82cruKe9XVCSBpQ3kaSaFNwqn',
  'EQCQ443Ko1TgfCg8xa_MdwtHmXr2Kv8YYDVAaBMI5gca6O3A',
  'EQCqBWSDYa6GhxgAOPxvIA1IpYB7iDOtacuetbJJixX1D5eQ',
  'EQBNoiznqLZkOOpZnMe09cb3qHHs_CPEaARXj4CHqgkm3h2n',
  'EQDBFX9c349S8x5nFvj4lNTlSJjF-MPnGJyVeHC0kYLsiJr-',
  'EQAoWzWy-fnyJaYhAmuuFNi-XWGEVkM02DkPsiglLToc87yd',
  'EQBMzh2QI7IctxbGhvQ8h5koT-jFwLyC0MA40x3_ib6q6XGE',
  'EQCymq--MlnzHxblgAi_nzZH9gmdkG5J_TU_vhvZS6aCXIiC',
  'EQCNoV4_z4AphGZk1b9Q2UuSJQs6Ug7vl-O-tVDmaea8HpAJ',
  'EQDzvSAKspPnYIhuqZe0_dMfrEEUlwKVzb4dJo0sRoxZwRZe',
  'EQD6NEcyDESwKua8-dvuMZyU8NVnYAVLc-cECE-y4ag312YK',
  'EQAA5QQvUIvOQL2HQuFAOkDHxL4CtxV5f3rx4HYkDN8ZFMp8',
  'EQCehI_q25Mz0oQtixUvyMx5Utw8KrwYZzkzwBWJ3wYFia5K',
  'EQBBfoVPCvVn1esMqaAaOwAwApAPsEqM-OOizXrWHqn5OF2f',
  'EQD-520LqsGs_XOoxsqa_rbhwC289UymixzJY41IqSWuWQcQ',
  'EQBCTojEKekPcp98nUoRd4w90dT4fy8xNvcAlgwpLMEPaiby',
  'EQCQcjj7DY_5Ol_WgzMLs3u65qSAoQ6-l8NlZDZ6uOq8tmvf',
  'EQBVW70pcbxesALqof3T7N1lVc9zgHylxCAGypbzsS-s5bFB',
  'EQAGR6IXjzG07T2dBH0-uO-9GUuHa6EcXRxJdP0YUI7iWCEx',
  'EQBvTLUrffaXCaIy7tsTFA-TmiK4_c386U4IJQYq_8GTKcMJ',
  'EQC9JDM0EviMOCORpy3j84Q01uYDlyIPfKuLrx4QXllZHVm-',
  'EQC7UlLTOFdMWRQDzOPLOM5qhUm4pXiPXwgYjmVq2W2IakmA',
  'EQD9A6mNvPFfMGKTbo8nLSgzb4iIUTe2PfZi0MxX85ZmPDLr',
  'EQD45WfnAgoHu1DB0thHpylU3jgGEFAFxATQ1q20Pv4szuH8',
  'EQC7Z5hOm0AkGutiunes3CqOI4HFkIefkpHN1aH6wh5s64hN',
  'EQDYrg4948FeeH4LMRUur9VB2Hzs_UQ2TYdl5xt4lkkV3DZQ',
  'EQATEy2gBxw0xPUM8Yl_7hrq-ClJpLw_xhvSH3CCj57zwCF4',

  'EQDR1lqTwhPJKjkEbICwXBbarhxCKXqNOlRTDMMbxbqambV0', // Testnet Ton Diamonds
].map((a) => Address.parse(a).toRawString())

export function isNftVerified(nft: NftItem | ImmutableObject<NftItem>) {
  if (nft.collection?.address && verifiedCollections.includes(nft.collection?.address)) {
    return true
  }

  return false
}
