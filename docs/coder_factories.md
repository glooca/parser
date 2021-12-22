# Creating your own coders

Besides implementing [`Coder<T>`](types.md#Coder) you can create coders with the following functions

Note: If you want to implement [`Coder<T>`](types.md#Coder) for a `class`, check [typedDecoderFactory](#typedDecoderFactory)'s usage

# decoderFactory

```ts
function decoderFactory<T>(data: CodingFormat<T> | CoderList<T>): Decoder<T>;
```

## Usage

```ts
interface MyInterface {
  someProp: number;
  anotherProp: string;
}
const myInterfaceCodingFormat: CodingFormat<MyInterface> = (r) => {
  r(u32(), "someProp");
  r(pad(2));
  r(nullTermStr, "anotherProp");
};
const myCoder: Coder<MyInterface> = {
  decode: decoderFactory(myInterfaceCodingFormat),
  encode: encoderFactory(myInterfaceCodingFormat),
};
```

# typedDecoderFactory

Note: [typedCoderFactory](#typedCoderFactory) uses this and [encoderFactory](#encoderFactory). Constructor not needed when encoding.

```ts
function typedDecoderFactory<T>(
  type: new (...args: any) => T,
  data: CodingFormat<T> | CoderList<T>
): Decoder<T>;
```

## Usage

```ts
const myInterfaceCodingFormat: CodingFormat<MyClass> = (r) => {
  r(u32(), "someProp");
  r(pad(2));
  r(nullTermStr, "anotherProp");
};
class MyClass implements Coder<MyClass> {
  someProp = 0;
  anotherProp = "";
  decode = typedDecoderFactory(MyClass, myInterfaceCodingFormat);
  encode = encoderFactory(myInterfaceCodingFormat);
}
```

# encoderFactory

```ts
function encoderFactory<T>(data: CodingFormat<T> | CoderList<T>): Encoder<T>;
```

## Usage

See [decoderFactory](#decoderFactory)'s and [typedDecoderFactory](#typedDecoderFactory)'s usage

# coderFactory

Note: `name` field can only be left empty with coders of type [`Coder<void>`](types.md#Coder)

Note: Any valid coder can be registered, even your own

```ts
function coderFactory<T>(format: CodingFormat<T>): Coder<T>;
```

## Usage

```ts
interface MyInterface {
  someProp: number;
  anotherProp: string;
}
const myCoder = coderFactory<MyInterface>((r) => {
  r(u32(), "someProp");
  r(pad(2));
  r(nullTermStr, "anotherProp");
});
```

# typedCoderFactory

Note: `name` field can only be left empty with coders of type `Coder<Void>`

Note: Any valid coder can be registered, even your own

```ts
function typedCoderFactory<T>(
  type: new (...args: any) => T,
  format: CodingFormat<T>
): Coder<T>;
```

## Usage

```ts
class MyClass {
  someProp = 0;
  anotherProp = "";
}
const myCoder = typedCoderFactory(MyClass, (r) => {
  r(u32(), "someProp");
  r(pad(2));
  r(nullTermStr, "anotherProp");
});
```
