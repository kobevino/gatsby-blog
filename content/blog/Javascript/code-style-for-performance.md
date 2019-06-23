---
title: 성능을 높이는 코드 스타일
date: 2019-06-23 15:06:68
category: Javascript
---

![](./images/code-style-for-performance-1.png)

> 출처 : NHN은 이렇게 한다! 자바스크립트 성능 이야기 (1년 전에 사놓고 지금 읽다니 :disappointed_relieved::disappointed_relieved:)

## 성능에 좋은 코드에 대해 관심을 갖던 계기?

필자가 거래소에서 일하기 전까지 자바스크릡트 코드 성능에 대해 큰 신경을 쓰지 않고 일해온 것이 사실이다. 개발자(?)로서 너무 부끄럽다.:disappointed_relieved: 경험을 살짝 이야기하자면 거래소 같이 실시간 통신을 해서 거래량을 보여주어야하는 서비스 같은 경우 자바스크립트 코드를 어떻게 작성하느냐에 따라 브라우저에 큰 영향을 끼친다는 것을 몸소 체험하게 되었다. 물론 항상 시간에 쫒기며 개발하게 되다보면 이정도(?)는 괜찮겠지 하고 넘어가는 경우가 허다했는데 이번에 기초부터 차근차근 알아보도록 하겠다.

### 객체의 생성, 초기화 성능

`Array` 및 `Object` 형식의 객체 생성과 초기화에 대해 알아보자.

```js{2}
var arr1 = new Array() // :x:
var arr2 = [] // :white_check_mark:
```

객체 생성 방식에 있어서 두 코드 별 차이는 없으나 **리터럴 형식**(`arr2`)이 조금 더 나은 성능을 보여준다.

```js{8}
var arr1 = []
for (var i = 0; i < 1000; i++) {
  arr1.push(i) // :x:
}

var arr2 = []
for (var i = 0; i < 1000; i++) {
  arr2[i] = i // :white_check_mark:
}
```

데이터를 배열에 삽입할 경우 `push()` 메서드를 사용하는 것보다 **접근자** `[]`를 사용한 데이터 할당이 더 나은 성능을 보여준다.

```js{2}
var obj1 = new Object() // :x:
var obj2 = {} // :white_check_mark:
```

객체 생성 또한 배열 생성할 때와 마찬가지로 성능상 별 차이는 없다. 하지만 js 파일을 다운로드하는 시간 관점에서 봤을 때는 **리터럴 형식**(`obj2`)처럼 코드 크기를 줄일 수 있는 방법이 성능상 더 좋다고 볼 수 있다.

### 스코프 체인 탐색과 성능

자바스크립트 코드 자체의 성능이 런타임 성능에 많은 영향을 준다고 한다. 그 중에서도 스코프 체인 탐색을 최적화해 성능을 끌어올리는 방법에 대해 알아보자!

```js
window.data = []

function addData() {
  for (var i = 0; i < 100; i++) {
    data[i] = i
  }
}

addData()
```

`addData()` 함수가 실행되면 `data`와 `i` 속성에 접근하기 위해 스코프 체인 탐색이 시작된다. `i`는 함수 안에 있는 지역변수이므로 활성화 객체에서 쉽게 탐색할 수 있다. 하지만 `data` 객체는 활성화 객체에서 탐색하지 못하고 다시 전역 객체를 탐색한다. 결국 `data`를 객체에 접근하기 위해서 loop를 실행하는 동안 **활성화 객체 -> 전역 객체**를 계속 탐색해야한다.

그럼 위 코드를 개선시켜보자.

```js{4}
window.data = []

function addData() {
  var localData = data // :thumbsup: important
  for (var i = 0; i < 100; i++) {
    localData[i] = i
  }
}

addData()
```

하이라이트로 된 부분이 최적화의 핵심 코드이다. `addData()` 함수가 실행되면 `data` 객체에 접근하기 위해 최초 한번만 활성화 객체와 전역 객체를 탐색한다. 그 이후부터는 `data` 객체는 `localData` 지역변수에 저장되어 있기 때문에 loop를 도는 동안 전역 객체를 탐색할 필요가 없다. 결국 탐색 시간이 줄어들었으므로 성능 또한 개선된다.

```js{6}
var obj = new Object()

Object.prototype.data = []

function addData() {
  var localData = obj.data
  for (var i = 0; i < 100; i++) {
    localData.push(i)
  }
}

addData()
```

`obj` 인스턴스 객체는 `Object`의 프로토타입을 상속받는다. 참조한 경로를 따라 탐색범위를 넓혀 나가므로 탐색과정을 줄여야한다. 그러기 위해선 `localData` 지역변수에 담아 불필요한 탐색과정을 줄여야한다.

### 반복문과 성능

자바스크립트에는 `for`, `for-in`, `while`, `do-while`라는 loop 구문들이 있다.

우선 `for-in` 구문이 테스트 결과 가장 느리다. 나머지 반복문들은 별 차이가 없다. 왜 느릴까? 그 이유는 다른 반복문과 달리 주어진 배열을 순차적으로 탐색하는게 아니라 배열이 아닌 객체로 취급하여 반복 시점마다 객체의 모든 속성을 무작위로 탐색한다. 그렇기 때문에 객체의 속성을 탐색하는데만 사용하길 권장한다.

```js
var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// :x:
for (var i = 0; i < arr.length; i++) {
  arr[i]++
}

// :white_check_mark:
for (var i = 0, size = arr.length; i < size; i++) {
  arr[i]++
}
```

보통 반복문을 작성할 때 첫번째 방식처럼 아무 생각없이 작성할 때가 많다. 하지만 첫번째 방식처럼 작성하게 되면 loop를 거칠때마다 `arr` 배열의 length 값을 연산하게 된다. 그렇기 때문에 두번째 방식처럼 `size`라는 지역변수에 배열의 길이를 저장하고 loop를 거칠때마다 `arr` 배열을 거칠 필요없이 지역변수에 접근하여 탐색 과정 시간을 줄인다.

### 조건문과 성능

자바스크립트 조건문에는 `if-else`, `switch-case`, `삼항연산자`가 있다.

세 가지의 조건문 성능 테스트 결과 별 차이는 없다. 하지만 조건 판단 요소가 많아지면 `switch-case` 구문이 좀 더 좋다는 점을 알아두자!

```js
function numberRange(value) {
  var range = ''
  if (value <= 10) {
    range = '~10'
  } else if (value <= 20) {
    range = '11~20'
  } else if (value <= 30) {
    range = '21~30'
  } else {
    range = '31~'
  }

  return range
}

numberRange(32)
```

숫자 범위를 알아보는 `numberRange`라는 함수가 있다. 위 코드는 입력하는 숫자에 따라 비교 연산 횟수가 달라진다. 최소 비교 연산횟수는 1, 최대 연산 횟수는 4번이다.

```js
// :thumbsup: Better!
function numberRange(value) {
  var range = ''

  if (value <= 20) {
    if (value <= 10) {
      range = '~10'
    } else {
      range = '11~20'
    }
  } else {
    if (value <= 30) {
      range = `21~30`
    } else {
      range = '31~'
    }
  }

  return range
}

numberRange(32)
```

위 코드는 계층구조를 활용한 조건 비교다. 어떤 값이 입력값으로 와도 비교 연산 횟수는 2번이다.

결국 두 비교 구문은 입력값 패턴에 따른 적절한 조건 분기 방식을 선택해 코드의 실행 성능을 높이는 것이 최선의 선택이다.

```js
function numberRange(value) {
  var arrRange = ['~10', '11~20', '21~30', '31~']

  var arrRangeIndex = Math.ceil(value / 10) - 1

  if (arrRangeIndex < 0) {
    arrRangeIndex = 0
  } else if (arrRangeIndex >= arrRange.length) {
    arrRangeIndex = arrRange.length - 1
  }

  return arrRange[arrRangeIndex]
}

numberRange(32)
```

위 코드는 배열을 이용한 조건문이다. 앞서 본 조건문들과 달리 하나의 `if-else` 구문으로 감소되었다.

```js
function numberRange(value) {
  var hashRange = { 1: '~10', 2: '11~20', 3: '21~30', 4: '31~' }

  var hashRangeKey = Math.ceil(value / 10)

  if (hashRange[hashRangeKey]) {
    return hashRange[hashRangeKey]
  }
  if (value <= 10) {
    return '~10'
  }

  return '31~'
}

numberRange(32)
```

위 코드는 배열 대신 해시 객체를 사용한 조건문이다.

배열과 해시 객체를 활용한 조건문이 코드 길이도 간결하고 비교 횟수도 적어 **다운로드 시간이 감소**할 것이다. 하지만 실행 성능 측정 결과 계층 구조를 활용한 조건 비교가 더 나은 성능 결과를 보여준다. 그 이유는 조건문 실행에 필수적인 배열과 해시 객체를 생성하고 탐색하는 시간과 `Math.ceil()` 함수를 호출하는 시간이 성능에 영향을 미쳤기 때문이다. 그래서 추가적인 비용이 없는 계층 구조를 활용한 조건 비교문이 가장 빠른 것이다.

조건문 같은 경우는 실행 성능, 다운로드 속도, 유지보수적인 측면을 고려하여 선택하는 것이 최적화된 방법일거라 생각한다. :smiley:

### 문자열 연산과 성능

프론트엔드 개발을 하다 보면 브라우저에 출력되는 문자열을 연산하는 경우가 주요 작업중 하나이다. 그럼 문자열 연산에서 실행 성능을 높일 수 있는 방법을 알아보자.

```js
var str1 = new String('ABCDEFGHIJKLMNOPQRSTUVWXYZ') // :x:
var str2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // :white_check_mark:
```

**리터럴**을 이용한 문자열 생성이 `String` 객체를 이용한 문자열 생성보다 훨씬 나은 성능을 보여준다.

```js
var str = ''

for (var i = 0; i < 10; i++) {
  str += 'test' //
}

var arr = [
  'test',
  'test',
  'test',
  'test',
  'test',
  'test',
  'test',
  'test',
  'test',
  'test',
]

var str2 = arr.join('')
```

책에서는 `Array.join()` 메서드를 이용한 문자열 병합이 가장 빠르다고 나와있지만 필자가 직접 테스트한 결과
`+=` 연산자를 이용한 문자열 병합이 `Array.join()` 메서드를 이용한 문자열 병합보다 상대적으로 빠른 성능을 보여주었다. 아마 브라우저 내부에서 최적화 작업을 하고 있다보니 브라우저 버전에 따라 성능이 달리 측정될 수 있을 것이라 조심스럽게 추측해본다. 책에도 언급되었듯이 직접 개발하면서 성능 측정을 하는 것을 권장한다.

### 정규표현식과 성능

정규표현식 성능에 관한 내용을 요약하자면 **탐색 대상의 축소**와 **컴파일 횟수 축소**다. 탐색 과정이 반복되지 않도록 주의하고 불필요한 작업을 줄이는데 주의를 기울이자!

### Wrap-up

지금까지 살펴본 내용들은 성능에 아주 미미한 영향을 끼치지만 *티클모아 태산*이라는 속담이 있듯이 효율적으로 작성한 작은 구문이 쌓일수록 비효율적으로 작성한 코드보다 점점 더 큰 성능 차이를 보이지 않을까 생각해본다. 마지막으로 위 코드의 모든 성능 테스트는 NHN에서 개발한 성능 테스트 도구인 [jsMatch](http://jindo.dev.naver.com/jsMatch/index.html)를 이용했다.

### Reference

[NHN은 이렇게 한다! 자바스크립트 성능 이야기](https://wikibook.co.kr/naver-javascript-performance/)
