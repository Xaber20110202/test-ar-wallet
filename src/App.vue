<template>
  <button @click="connect">
    Connect
  </button>
  <div>{{ account }}</div>

  <button @click="send">
    send {{ amount }} AR
  </button>
  <h3>send Result</h3>
  <div v-if="sendResult">
    <div>
      {{ JSON.stringify(sendResult) }}
    </div>

    <a style="display:block;" :href="`https://arweave.net/tx/${sendResult.id}/status`" target="_blank">https://arweave.net/tx/{{ sendResult.id }}/status</a>
    <a :href="`https://arweave.net/tx/${sendResult.id}`" target="_blank">https://arweave.net/tx/{{ sendResult.id }}</a>
  </div>

  <div style="height: 3px; width: 100%;background-color: red;" />

  <button @click="sign">
    sign
  </button>
  <div>everHash: {{ everHash }}</div>
  <h3>sign Result</h3>
  <div v-if="signResult">
    {{ JSON.stringify(signResult) }}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import arweaveUtil from './arweave'

const handleChainLoadedWithin1sAsync = async (): Promise<void> => {
  let loaded = false
  return await new Promise((resolve) => {
    window.addEventListener('arweaveWalletLoaded', () => {
      loaded = true
      resolve()
    })
    setTimeout(() => {
      if (!loaded) {
        resolve()
      }
    }, 1000)
  })
}

const getAccountAsync = async (params: any): Promise<string> => {
  const { userOperateCausedNoAccounts } = params
  await handleChainLoadedWithin1sAsync()
  const isInstalled = window.arweaveWallet !== undefined

  if (!isInstalled) {
    setTimeout(() => {
      window.open('https://chrome.google.com/webstore/detail/arconnect/einnioafmpimabjcddiinlhmijaionap?utm_source=chrome-ntp-icon')
    }, 1000)
    throw new Error('pls_install_arconnect')
  }

  if (userOperateCausedNoAccounts) {
    return ''
  } else {
    try {
      await window.arweaveWallet.connect([
        'ACCESS_ADDRESS',
        'ACCESS_ALL_ADDRESSES',
        'ACCESS_PUBLIC_KEY',
        'SIGN_TRANSACTION',
        'SIGNATURE'
      ])
      const activeArAddr = await window.arweaveWallet.getActiveAddress()
      return activeArAddr ?? ''
    } catch (e) {
      // TODO: arConnect 缺乏用户取消的详细报错信息
      throw new Error('error.deny_connect')
    }
  }
}

export default defineComponent({
  setup () {
    const account = ref('')
    const amount = 0.000001
    const sendResult = ref('')
    const signResult = ref('')
    const everHash = '0x29e429bdfab51a47c887d6ce196a3b4d30fcf402c1aae162db3d374b19b9a88e'
    const connect = async () => {
      account.value = await getAccountAsync({ userOperateCausedNoAccounts: false })
    }

    const send = async () => {
      sendResult.value = 'sending'
      try {
        sendResult.value = await arweaveUtil.transferAsync('use_wallet', {
          symbol: 'AR',
          token: {},
          from: account.value,
          to: '5NPqYBdIsIpJzPeYixuz7BEH_W7BEk_mb8HxBD3OHXo',
          value: amount * Math.pow(10, 12)
        })
      } catch (e) {
        console.log('send error', e)
      }
    }

    const sign = async () => {
      signResult.value = 'signing'
      try {
        signResult.value = await arweaveUtil.signMessageAsync('use_wallet', account.value, everHash)
      } catch (e) {
        console.log('sign error', e)
      }
    }

    return {
      send,
      sign,
      amount,
      connect,
      account,
      everHash,
      sendResult,
      signResult
    }
  }
})
</script>
