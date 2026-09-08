import {
  Baby,
  DoorOpen,
  DoorClosed,
  HandCoins,
  type LucideIcon,
  Settings,
  ShieldCheck,
  Trash2,
  Undo2,
  UserCheck,
  UserCog,
  UserMinus,
  UserPlus,
  UserX,
  KeyRound,
} from "lucide-react";

type AuditDisplay = {
  icon: LucideIcon;
  /** Translation key under `dashboard.admin.activity.actions.*` */
  labelKey: string;
  /** Semantic colour tone for the icon */
  tone: "primary" | "secondary" | "tertiary" | "error" | "neutral";
};

/**
 * Maps raw audit `action` code to a human-friendly icon, translation key, and tone.
 *
 * The dashboard activity feed is read by non-technical admins, so we replace
 * database identifiers like `child.check_in` / `ChildCheckIn` with plain
 * language and a coloured icon.
 */
export function getAuditDisplay(action: string): AuditDisplay {
  const map: Record<string, AuditDisplay> = {
    "child.check_in": {
      icon: DoorOpen,
      labelKey: "childCheckIn",
      tone: "primary",
    },
    "child.check_out": {
      icon: DoorClosed,
      labelKey: "childCheckOut",
      tone: "secondary",
    },
    "child.check_in_delete": {
      icon: Trash2,
      labelKey: "childCheckInDelete",
      tone: "error",
    },
    "child_class.activate": {
      icon: Baby,
      labelKey: "childClassActivate",
      tone: "primary",
    },
    "child_class.deactivate": {
      icon: Baby,
      labelKey: "childClassDeactivate",
      tone: "neutral",
    },
    "user.create": {
      icon: UserPlus,
      labelKey: "userCreate",
      tone: "primary",
    },
    "user.update": {
      icon: UserCog,
      labelKey: "userUpdate",
      tone: "tertiary",
    },
    "user.reset_password": {
      icon: KeyRound,
      labelKey: "userResetPassword",
      tone: "secondary",
    },
    "user.activate": {
      icon: UserCheck,
      labelKey: "userActivate",
      tone: "primary",
    },
    "user.deactivate": {
      icon: UserX,
      labelKey: "userDeactivate",
      tone: "error",
    },
    "member.delete": {
      icon: UserMinus,
      labelKey: "memberDelete",
      tone: "error",
    },
    "member.restore": {
      icon: Undo2,
      labelKey: "memberRestore",
      tone: "primary",
    },
    "giving.delete": {
      icon: HandCoins,
      labelKey: "givingDelete",
      tone: "error",
    },
    "settings.update_operational": {
      icon: Settings,
      labelKey: "settingsUpdate",
      tone: "tertiary",
    },
  };

  return map[action] ?? {
    icon: ShieldCheck,
    labelKey: "unknown",
    tone: "neutral" as const,
  };
}
