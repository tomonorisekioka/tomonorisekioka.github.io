# BGMの出典・利用条件（2026-10-17 確認）

このページは、`game.html` のクラシック曲8bitアレンジについて、**原曲の著作権**と**参照した現代の編曲・採譜データの利用条件**を分けて記録するものです。

## 共通事項

- 対象作曲家：Edvard Grieg（1907年没）、Erik Satie（1925年没）、Georges Bizet（1875年没）。
- 日本での原曲の著作権保護期間は、いずれも満了しています。原曲を新たに演奏・編曲すること自体は原則可能です。
- このサイトではブラウザの Web Audio API により波形を生成します。商用録音、配信音源、市販MIDI、既存の録音サンプルは使用していません。
- **原曲がパブリックドメインであっても、独立に創作された現代の編曲は別の権利を持つことがあります。** この区別は必須です。

## 1. グリーグ『朝』 / Morning Mood

- 原曲：Edvard Grieg — *Peer Gynt*、著作権保護期間満了。
- 使用した音符データの出典：[cellist / Lilypond-Sheet-Music — *Morgenstimmung*](https://github.com/cellist/Lilypond-Sheet-Music/tree/master/Fl%2C%20Fl%2C%20Vl%2C%20Vlc/Grieg%2C%20Edvard/Morgenstimmung)
- 編曲：**Diethart Stecher**。GitHub版の入力日は2025-03-03。音符を抜き出し、移調・8bit化した4声のデータを利用。
- 出典リポジトリの[README](https://github.com/cellist/Lilypond-Sheet-Music/blob/master/README.md)には、掲載楽譜の利用・共有を歓迎する記載があります。ただし、**この特定の編曲を改変して公開することまで許諾する明示的なライセンス条文は確認できていません**。READMEの書き手と編曲者も必ずしも同一ではありません。
- **監査結果：要確認。** 編曲者から二次利用・改変・公開について許諾を得るか、保護期間が満了した原典譜から独自に編曲し直すことを推奨します。クレジット表記だけで許諾が不要になるわけではありません。

## 2. サティ『ジムノペディ第1番』 / Gymnopédie No. 1

- 原曲：Erik Satie、1888年作。
- 出典：[Mutopia Project — LilyPond譜](https://github.com/MutopiaProject/MutopiaProject/blob/master/ftp/SatieE/gymnopedie_1/gymnopedie_1.ly)、入力者 **Evin Robertson**。
- ソースの `license` フィールドは **`Public Domain`**。原典はパブリックドメイン版に基づくと明記。
- このゲームでは両手パートの音符・伴奏・反復・2つの結末を抽出して独自の電子音で演奏。
- **監査結果：利用条件は明確。** 出典と入力者へのリンクを継続掲載します。

## 3. ビゼー『カルメン：闘牛士の歌』 / Toreador Song

- 原曲：Georges Bizet、1875年作。
- 実際に使用した歌唱・弦楽器の音符データ：[CostardRouge / system-g — bizet-carmen-toreador.txt](https://github.com/CostardRouge/system-g/blob/main/public/player/scores/bizet-carmen-toreador.txt)。
- このリポジトリの `package.json` は `"license": "MIT"` ですが、確認時に独立した `LICENSE` ファイルは見つからず、**個別の楽譜データがそのライセンスの対象であることは未確認**です。
- フランスの独自音律用に記された音符を平均律のMIDI音高・音価へ変換し、ゲーム用の伴奏を付けています。
- **監査結果：要確認。** データ提供者に個別の採譜データの二次利用条件を確認するか、19世紀の保護期間満了の楽譜から独自に採譜し直すと確実です。
- 注意：以前のプログラムコメントには、Mutopia Project の **Carmen Prelude（CC BY-SA 2.5）**を音符の直接の出典とする誤記がありました。現在のこの曲のデータは **MutopiaのPrelude譜面を使用していません**。その誤記は修正しました。

## 現状の整理

| 対象 | 原曲の権利 | 参照した楽譜データ | 評価 |
| --- | --- | --- | --- |
| グリーグ『朝』 | 保護期間満了 | Diethart Stecherによる現代編曲 | **改変公開の許諾条件が未確定** |
| サティ『ジムノペディ第1番』 | 保護期間満了 | Mutopia: Public Domain | **確認済み** |
| ビゼー『闘牛士の歌』 | 保護期間満了 | Système G採譜データ | **譜面データのライセンス範囲が未確定** |
| ゲーム内の波形合成 | — | Web Audioで新たに合成 | 第三者の録音は使用していない |

以上は出典の監査記録であり、他者の編曲・採譜データに対してユーザーへ再利用権を付与するライセンス文書ではありません。権利者による正式な許諾書でもありません。

参考：日本の著作権保護期間とパブリックドメインの利用については[文化庁](https://www.bunka.go.jp/seisaku/chosakuken/taisetsu/point/index.html)をご参照ください。
