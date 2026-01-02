<?php

declare(strict_types=1);

namespace PokemonGoApi\PogoAPI\Types;

use Exception;
use PokemonGoApi\PogoAPI\IO\GithubLoader;

use function array_key_exists;
use function count;
use function preg_match;
use function str_replace;

final readonly class PokemonImage
{
    private function __construct(
        private string $imageName,
        private int $dexNr,
        private bool $isShiny,
        private string|null $form,
        private string|null $costume,
        private bool $isFemale,
    ) {
    }

    public static function createFromFilePath(string $path): self
    {
        $matches = [];
        $result  = preg_match(
            <<<'REGEX'
            ~(pokemon_icon_(
                (?<dexNr>\d{1,4})_(?<assetBundleValue>\d{2})(_(?<costume>\d{2}))?
                |
                (?<assetBundleSuffix>pm(?<dexNr2>\d{1,4})_(?<assetBundleValue2>\d{2})\w+?)
             )
             (?<isShiny>_shiny)?)
             \.png$~x
            REGEX,
            $path,
            $matches,
        );

        if ($result !== false && count($matches) > 0) {
            return new self(
                $matches[0],
                (int) ($matches['dexNr'] ?: $matches['dexNr2']),
                array_key_exists('isShiny', $matches),
                isset($matches['assetBundleSuffix']) && $matches['assetBundleSuffix'] !== ''
                    ? $matches['assetBundleSuffix']
                    : null,
                isset($matches['costume']) && $matches['costume'] !== '' ? $matches['costume'] : null,
                (int) ($matches['assetBundleValue'] ?? $matches['assetBundleValue2'] ?? 0) === 1,
            );
        }

        $matches = [];
        $result  = preg_match(
            <<<'REGEX'
                ~/?pm(?<dexNr>\d{1,4})
                (\.f(?<form>[^\.]+))?
                (\.c(?<costume>[^\.]+))?
                (?<gender>\.g2)?
                (?<isShiny>\.s)?
                \.icon\.png~x
                REGEX,
            $path,
            $matches,
        );

        if ($result === false || $matches === []) {
            throw new Exception('Path "' . $path . '" does not match Regex', 1617886414508);
        }

        return new self(
            $matches[0],
            (int) ($matches['dexNr']),
            ($matches['isShiny'] ?? '') !== '',
            ! isset($matches['form']) || $matches['form'] === '' ? null : $matches['form'],
            ! isset($matches['costume']) || $matches['costume'] === '' ? null : $matches['costume'],
            ($matches['gender'] ?? '') !== '',
        );
    }

    public function buildUrl(bool $shiny = false): string
    {
        if ($shiny) {
            return GithubLoader::ASSETS_BASE_URL . str_replace('.icon', '.s.icon', $this->imageName);
        }

        return GithubLoader::ASSETS_BASE_URL . $this->imageName;
    }

    public function getForm(): string|null
    {
        return $this->form;
    }

    public function getCostume(): string|null
    {
        return $this->costume;
    }

    public function getDexNr(): int
    {
        return $this->dexNr;
    }

    public function isShiny(): bool
    {
        return $this->isShiny;
    }

    public function isFemale(): bool
    {
        return $this->isFemale;
    }
}
