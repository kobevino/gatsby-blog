---
title: useCallback 사용법
date: 2020-02-02 14:02:28
category: react
---

React Hooks가 나온지 꽤 지났지만 지금에서야 적용해본다.ㅎㅎ 팀원과 서로 코드 리뷰를 하다가 `useCallback`에 대해 서로 의견을 나누게 되었다. `useCallback`은 언제 사용해야되는걸까? 한번 정리해보기로 했다.

## <i class="devicon-react-original colored" style="font-size: 1.3rem;"></i> useCallback?

[리액트 공식 홈페이지](https://reactjs.org/)에서 아래와 같이 정의한다.

> Returns a memoized callback. Pass an inline callback and an array of dependencies. useCallback will return a memoized version of the callback that only changes if one of the dependencies has changed. This is useful when passing callbacks to optimized child components that rely on reference equality to prevent unnecessary renders (e.g. shouldComponentUpdate).

요약하자면 이렇다. `useCallback`은 메모이제이션된 콜백을 반환하고 인라인 콜백과 의존성 배열을 전달한다. 의존성 배열 중 하나라도 변경이 되면 새로운 메모이제이션된 버전의 콜백이 반환된다. 보통 불필요한 리렌더링을 막기 위해 최적화가 필요한 자식 컴포넌트가 있을 경우 사용한다.

### 최적화가 필요하지 않은 경우

간단한 카운터 기능을 구현해보면서 이해를 해보도록 하자!

```js{7,8}
// App.js
import React, { useState, useCallback } from 'react'

function App() {
  const [count, setCount] = useState(0)

  const onIncrease = () => setCount(count + 1) // :white_check_mark: right way in this case
  const onDecrease = () => setCount(count - 1) // :white_check_mark: right way in this case

  // :x: wrong way in this case
  const onIncrease = useCallback(
    e => {
      setCount(count + 1)
    },
    [count]
  )

  // :x: wrong way in this case
  const onDecrease = useCallback(
    e => {
      setCount(count - 1)
    },
    [count]
  )

  return (
    <div>
      <h3>{count}</h3>
      <button onClick={onIncrease}>+1</button>
      <button onClick={onDecrease}>-1</button>
    </div>
  )
}

export default App
```

위 코드를 보면 컴포넌트 최적화할 필요가 있는 child 컴포넌트를 가지고 있지 않다. 근데 굳이 `useCallback`을 사용해야할까? 사용하면 어떤 일이 발생하는지 생각해보자. 의존성 배열에 있는 `count`라는 값이 바뀔때마다 새로운 버전의 메모이제이션된 콜백이 반환되고 불필요한 함수 호출로 인해 더 많은 비용을 초래하게 되므로 이런 경우는 일반 인라인 함수를 전달하는게 맞다고 생각한다.

### 최적화가 필요한 경우

자식 컴포넌트를 만들어서 테스트해보자.

```js{5}
// Button.js
import React from 'react'

function Button({ children, onClick }) {
  console.log('render', children) // measure reandering of component
  return <button onClick={onClick}>{children}</button>
}

export default Button
```

```js
// App.js
import React, { useState } from 'react'
import Button from './Button'

function App() {
  const [count, setCount] = useState(0)

  const onIncrease = () => setCount(count + 1) // :x: wrong way in this case
  const onDecrease = () => setCount(count - 1) // :x: wrong way in this case

  return (
    <div>
      <h3>{count}</h3>
      <Button onClick={onIncrease}>+1</Button>
      <Button onClick={onDecrease}>-1</Button>
    </div>
  )
}

export default App
```

<iframe
  src="https://codesandbox.io/embed/optimistic-cherry-ulrcx?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="optimistic-cherry-ulrcx"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

콘솔 로그를 살펴보자!

`count` 값이 바뀔때마다 `Button` 컴포넌트는 쓸데없이 두번씩 렌더링 된다. 그 이유는 상태가 변하면서 새로운 함수(`onIncrease`, `onDecrease`)들이 새로 만들어졌기 때문에 child 컴포넌트인 `Button` 컴포넌트에 그대로 전달되므로 두번씩 렌더링된다.

그럼 최적화를 위해 위 코드를 수정해보겠다.

```js{2}
// Button.js
export default React.memo(Button) // :thumbsup: important
```

`React.memo`는 `shouldComponentUpdate` 랑 비슷한 기능을 한다. 비교 연산을 통해 props 값의 변경상태가 있을때만 렌더링하게 되는 역할을 한다.

```js
// App.js
const onIncrease = useCallback(
  e => {
    // setCount(prevCount => prevCount + 1);
    setCount(count + 1)
  },
  [count]
)

const onDecrease = useCallback(
  e => {
    // setCount(prevCount => prevCount + 1);
    setCount(count - 1)
  },
  [count]
)
```

<iframe
  src="https://codesandbox.io/embed/affectionate-bush-298ct?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="affectionate-bush-298ct"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

로그를 확인해볼까?

이상하다. 🤔🤔🤔 최적화를 했는데 이전과 같이 로그가 두번씩 찍힌다. 그 이유는 두 함수 모두 `useCallback`의 **dependency array**에 `count`가 참조되었다. 값이 변경되면 두 함수 모두 새로운 메모이제이션된 콜백이 반환되고 child 컴포넌트에 그대로 전달된다.

그럼 해결책은?

`count` 값을 참조시키지 말고 빈 배열로 생성하고 `setCount` 함수의 파라미터값(previous State)을 사용하여 연산을 해보자.

```js{3,7}
// App.js
const onIncrease = useCallback(e => {
  setCount(prevCount => prevCount + 1)
}, [])

const onDecrease = useCallback(e => {
  setCount(prevCount => prevCount - 1)
}, [])
```

<iframe
  src="https://codesandbox.io/embed/quiet-microservice-50j2c?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="quiet-microservice-50j2c"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

처음 렌더링 이후 아무리 값을 변경해도 자식 컴포넌트에 렌더링이 일어나지 않는다. **dependency array**에 어떠한 값도 참조되지 않았으므로 `onIncrease`, `onDecrease` 인스턴스들은 동일한 함수이다. 그렇기 때문에 자식 컴포넌트에 전달되지 않는다. 최적화 끝!! :smiley::smiley::smiley:

### Wrap-up

제대로 모르고 쓰면 오히려 불필요한 함수 호출과 비용을 초래하게 되므로 어플레이케이션 성능을 저하시킨다. 개인적으로는 개발할 때 자식 컴포넌트에 로그를 찍으며 컴포넌트 최적화하는 연습을 충분히 하는것이 좋다고 생각한다.

- [Hooks API Reference](https://reactjs.org/docs/hooks-reference.html#usecallback)
