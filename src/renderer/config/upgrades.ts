import { Upgrade, UpgradeType } from "../game/core/types"
import { t } from '../i18n/LanguageManager';

/**
 * Flat array of all upgrades with prerequisites
 * Root upgrades have no prerequisites
 * Child upgrades specify their prerequisites
 */
export function getUpgrades() : Upgrade[] {
    return [
        // === ROOT UPGRADES ===
        {
            name: t('game.upgrades.batWidth.name'),
            description: t('game.upgrades.batWidth.description'),
            times: 3,
            type: UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT,
        },
        {
            name: t('game.upgrades.ballDamage.name'),
            description: t('game.upgrades.ballDamage.description'),
            times: 3,
            type: UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1,
        },

        // === BAT WIDTH BRANCH ===
        {
            name: t('game.upgrades.lasers.name'),
            description: t('game.upgrades.lasers.description'),
            times: 1,
            type: UpgradeType.BAT_ADD_SHOOTER,
            prerequisites: [
                { type: UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, level: 2 },
            ],
        },
        {
            name: t('game.upgrades.lasersPlus.name'),
            description: t('game.upgrades.lasersPlus.description'),
            times: 3,
            type: UpgradeType.BAT_SHOOTER_INCREASE_10_PERCENT,
            prerequisites: [
                { type: UpgradeType.BAT_ADD_SHOOTER, level: 1 },
            ],
        },
        {
            name: t('game.upgrades.additionalShooter.name'),
            description: t('game.upgrades.additionalShooter.description'),
            times: 2,
            type: UpgradeType.BAT_ADDITIONAL_SHOOTER,
            prerequisites: [
                { type: UpgradeType.BAT_SHOOTER_INCREASE_10_PERCENT, level: 2 },
            ],
        },
        {
            name: t('game.upgrades.lives.name'),
            description: t('game.upgrades.lives.description'),
            times: 3,
            type: UpgradeType.HEALTH_INCREASE_1,
            prerequisites: [
                { type: UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, level: 2 },
            ],
        },
        {
            name: t('game.upgrades.bombs.name'),
            description: t('game.upgrades.bombs.description'),
            times: 1,
            type: UpgradeType.BAT_ADD_BOMBS,
            prerequisites: [
                { type: UpgradeType.HEALTH_INCREASE_1, level: 2 },
            ],
        },
        {
            name: t('game.upgrades.stickyBat.name'),
            description: t('game.upgrades.stickyBat.description'),
            times: 1,
            type: UpgradeType.BAT_ADD_STICKY,
            prerequisites: [
                { type: UpgradeType.BAT_ADD_BOMBS, level: 1 },
            ],
        },

        // === BALL DAMAGE BRANCH ===
        {
            name: t('game.upgrades.piercing.name'),
            description: t('game.upgrades.piercing.description'),
            times: 1,
            type: UpgradeType.BALL_ADD_PIERCING,
            prerequisites: [
                { type: UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1, level: 2 },
            ],
        },
        {
            name: t('game.upgrades.piercingPlus.name'),
            description: t('game.upgrades.piercingPlus.description'),
            times: 3,
            type: UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT,
            prerequisites: [
                { type: UpgradeType.BALL_ADD_PIERCING, level: 1 },
            ],
        },
        {
            name: t('game.upgrades.piercingDuration.name'),
            description: t('game.upgrades.piercingDuration.description'),
            times: 3,
            type: UpgradeType.BALL_PIERCING_DURATION,
            prerequisites: [
                { type: UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT, level: 2 },
            ],
        },
        {
            name: t('game.upgrades.criticalHits.name'),
            description: t('game.upgrades.criticalHits.description'),
            times: 1,
            type: UpgradeType.BALL_ADD_CRITICAL_HITS,
            prerequisites: [
                { type: UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1, level: 2 },
            ],
        },
        {
            name: t('game.upgrades.criticalHitsPlus.name'),
            description: t('game.upgrades.criticalHitsPlus.description'),
            times: 3,
            type: UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT,
            prerequisites: [
                { type: UpgradeType.BALL_ADD_CRITICAL_HITS, level: 1 },
            ],
        },
        {
            name: t('game.upgrades.explosions.name'),
            description: t('game.upgrades.explosions.description'),
            times: 1,
            type: UpgradeType.BALL_EXPLOSIONS,
            prerequisites: [
                { type: UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1, level: 2 },
            ],
        },
        {
            name: t('game.upgrades.explosionsPlus.name'),
            description: t('game.upgrades.explosionsPlus.description'),
            times: 3,
            type: UpgradeType.BALL_EXPLOSIONS_INCREASE_10_PERCENT,
            prerequisites: [
                { type: UpgradeType.BALL_EXPLOSIONS, level: 1 },
            ],
        },
        {
            name: t('game.upgrades.explosionRadius.name'),
            description: t('game.upgrades.explosionRadius.description'),
            times: 3,
            type: UpgradeType.BALL_EXPLOSION_RADIUS_INCREASE_20_PERCENT,
            prerequisites: [
                { type: UpgradeType.BALL_EXPLOSIONS_INCREASE_10_PERCENT, level: 1 },
            ],
        },

        // === SUPER STATS (requires all three terminal upgrades maxed) ===
        {
            name: t('game.upgrades.superStats.name'),
            description: t('game.upgrades.superStats.description'),
            times: 10,
            type: UpgradeType.BALL_SUPER_STATS,
            prerequisites: [
                { type: UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT, level: 3 }, // Primary parent (first)
                { type: UpgradeType.BALL_PIERCING_DURATION, level: 3 },
                { type: UpgradeType.BALL_EXPLOSION_RADIUS_INCREASE_20_PERCENT, level: 3 },
            ],
        },

        // === MULTI BALL (requires Sticky Bat and More Lasers maxed) ===
        {
            name: t('game.upgrades.multiBall.name'),
            description: t('game.upgrades.multiBall.description'),
            times: 10,
            type: UpgradeType.BALL_ADD_MULTIBALL,
            prerequisites: [
                { type: UpgradeType.BAT_ADD_STICKY, level: 1 }, // Primary parent (first)
                { type: UpgradeType.BAT_ADDITIONAL_SHOOTER, level: 2 }, // Requires More Lasers maxed
            ],
        },
    ]
}


