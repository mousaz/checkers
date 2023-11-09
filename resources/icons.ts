const icons: Map<string, string> = new Map();

icons.set(
  "concede",
  "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE3LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDUxMS43OTUgNTExLjc5NSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTExLjc5NSA1MTEuNzk1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8cGF0aCBkPSJNNDk3LjQ5NiwzMTYuNTI0bC01My4yMzgtMTIzLjY4MWw0NS43MjktMTEzLjIzN2M0LjQwOC0xMC45MTcsMi40NTctMjIuODMzLTUuMjItMzEuODc2DQoJCWMtNy45NTQtOS4zNy0yMC40NDgtMTMuNDk3LTMyLjYxMy0xMC43N2MtMzMuMjI0LDcuNDUtNjcuNjU2LDEwLjkxOS0xMDguMzYsMTAuOTE5Yy03NC4xMTQsMC0xMDkuOTU5LTYuMDE0LTE0NC42MjQtMTEuODMxDQoJCWMtMzQuMDYyLTUuNzE1LTY5LjI0OC0xMS42MTctMTM5LjQxMy0xMi4wMzR2LTAuMDIxQzU5Ljc1NywxMC43NjMsNDguOTkzLDAsMzUuNzYzLDBTMTEuNzcsMTAuNzYzLDExLjc3LDIzLjk5M3Y0NjMuODA5DQoJCWMwLDEzLjIzLDEwLjc2MywyMy45OTQsMjMuOTkzLDIzLjk5NHMyMy45OTQtMTAuNzY0LDIzLjk5NC0yMy45OTRWMzUxLjk2N2M2OC44MjUsMC40MTcsMTAzLjM1MSw2LjIwNSwxMzYuNzY2LDExLjgxMg0KCQljMzUuMzExLDUuOTI0LDcxLjgyNCwxMi4wNTEsMTQ3LjI3MSwxMi4wNTFjNjMuNjQ0LDAsMTA0LjA5LTguNzQyLDEzMi4yMTctMTYuMzU4YzkuMjMyLTIuNSwxNi44NTctOC43NiwyMC45MjItMTcuMTc2DQoJCUM1MDAuODUsMzM0LjE4Nyw1MDEuMDU1LDMyNC43OTMsNDk3LjQ5NiwzMTYuNTI0eiBNNDgyLjUyNiwzMzUuMzM3Yy0yLjA0Niw0LjIzNi01Ljk0NSw3LjQwNC0xMC42OTYsOC42OTENCgkJYy0yNy4xNyw3LjM1Ny02Ni4yNzcsMTUuODAyLTEyOC4wMzUsMTUuODAyYy03NC4xMTQsMC0xMDkuOTU5LTYuMDE0LTE0NC42MjQtMTEuODMxYy0zNC4wNjItNS43MTUtNjkuMjQ4LTExLjYxNy0xMzkuNDEzLTEyLjAzNA0KCQlWNjIuOTQxYzAtNC40MTgtMy41ODItOC04LThzLTgsMy41ODItOCw4djQyNC44NjFjMCw0LjQwOC0zLjU4Niw3Ljk5NC03Ljk5NCw3Ljk5NGMtNC40MDcsMC03Ljk5My0zLjU4Ni03Ljk5My03Ljk5NFYyMy45OTMNCgkJYzAtNC40MDcsMy41ODYtNy45OTMsNy45OTMtNy45OTNjNC40MDgsMCw3Ljk5NCwzLjU4Niw3Ljk5NCw3Ljk5M3Y3Ljk4OGMwLDAuMDAyLDAsMC4wMDMsMCwwLjAwNXMwLDAuMDAzLDAsMC4wMDUNCgkJYzAsNC40MTgsMy41ODIsOCw4LDhjNzQuMjEsMCwxMTAuMDc5LDYuMDE4LDE0NC43NjYsMTEuODM4YzM1LjMxMSw1LjkyNCw3MS44MjQsMTIuMDUxLDE0Ny4yNzEsMTIuMDUxDQoJCWM0MS45MTMsMCw3Ny40NTgtMy41OTMsMTExLjg2MS0xMS4zMDdjNi40MzUtMS40NDEsMTIuNzYsMC42MTcsMTYuOTE0LDUuNTExYzMuODEzLDQuNDkyLDQuNzU0LDEwLjE1MywyLjU4MiwxNS41MzINCgkJbC00Ni45NzksMTE2LjMzMWMtMC43OTksMS45OC0wLjc3NCw0LjE5NywwLjA3LDYuMTU5bDU0LjU1NywxMjYuNzQ2QzQ4NC41NDksMzI2LjkxNSw0ODQuNDUyLDMzMS4zNDksNDgyLjUyNiwzMzUuMzM3eiIvPg0KCTxwYXRoIGQ9Ik00MzkuNzc0LDk3LjEyYzAuOTgyLDAuMzk3LDEuOTk2LDAuNTg0LDIuOTk0LDAuNTg0YzMuMTY1LDAsNi4xNjItMS44OTEsNy40Mi01LjAwNmw0LjM4MS0xMC44NDcNCgkJYzEuNjU1LTQuMDk3LTAuMzI1LTguNzU5LTQuNDIxLTEwLjQxNGMtNC4wOTUtMS42NTUtOC43NTksMC4zMjUtMTAuNDE0LDQuNDIxbC00LjM4MSwxMC44NDcNCgkJQzQzMy42OTgsOTAuODAzLDQzNS42NzcsOTUuNDY1LDQzOS43NzQsOTcuMTJ6Ii8+DQoJPHBhdGggZD0iTTQzNC42OTEsMTA5LjQ5M2MtNC4xMTUtMS42MTQtOC43NTYsMC40MTQtMTAuMzY5LDQuNTI3bC0yMCw1MWMtMS42MTMsNC4xMTMsMC40MTQsOC43NTYsNC41MjcsMTAuMzY5DQoJCWMwLjk1OSwwLjM3NiwxLjk0NywwLjU1NCwyLjkxOSwwLjU1NGMzLjE5NSwwLDYuMjEzLTEuOTI3LDcuNDUtNS4wODFsMjAtNTFDNDQwLjgzMSwxMTUuNzQ5LDQzOC44MDQsMTExLjEwNiw0MzQuNjkxLDEwOS40OTN6Ii8+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==",
);

export default function getIcon(name: string): string {
  return icons.get(name) || "";
}
