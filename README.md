# Token Wrapper

<p align="center">
<img src="token-wrapper.png" alt="Token Wrapper" width="300">
</p>

[Token Wrapper](https://token-wrapper.vercel.app) is a Decentralized Application which enables users to wrap Native and ERC20 tokens on supported EVM compatible chains. Currently supports Mumbai with FREE! BuidlGuidl token mint🫡🏘

[Video Demo](https://youtu.be/2yWslxe1iOk)

# How It Works

To wrap native tokens(MATIC), funds are transferred to the (MATICClone contract)[http://url.com] which then mints an equivalent amount of MATICc to the depositor.
To wrap ERC20 tokens(BuidlGuidl), the (BGClone contract)[http://url.com] is approved to spend the amount to wrap before calling the `deposit` function with the amount. An equivalent amount of BGc is then minted to the depositor.
To withdraw or unwrap, call the `withdraw` functon on any of the contracts with the amount to withdraw which will be burned before an equivalent amount is transferred to the withdrawer

# Local Development

### Install dependencies:

```shell
yarn
```

### Run unit tests:

```shell
yarn test
```

### Deploy contracts:

```shell
yarn deploy
```

### Run frontend:

```shell
yarn start
```

# Acknowledgements

- [ScaffoldETH V2](https://github.com/scaffold-eth/se-2)
