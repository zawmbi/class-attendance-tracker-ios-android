import { PropsWithChildren } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { useAppPalette } from "@/theme/useAppPalette";

interface FormFieldProps extends PropsWithChildren {
  label: string;
  helper?: string;
}

export const FormField = ({ label, helper, children }: FormFieldProps) => {
  const palette = useAppPalette();

  return (
    <View className="mb-5">
      <Text className="mb-2 text-[11px] uppercase tracking-[1.8px]" style={{ color: palette.muted }}>
        {label}
      </Text>
      {children}
      {helper ? (
        <Text className="mt-2 text-xs leading-5" style={{ color: palette.muted }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
};

export const FormInput = (props: TextInputProps) => {
  const palette = useAppPalette();
  return (
    <TextInput
      placeholderTextColor={palette.muted}
      style={{
        borderRadius: 22,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        paddingHorizontal: 16,
        paddingVertical: 16,
        color: palette.ink,
        fontSize: 16
      }}
      {...props}
    />
  );
};
