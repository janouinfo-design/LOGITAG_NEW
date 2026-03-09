import { Chip } from "primereact/chip"

export const FamilleTagTemplate = (rowData) => {
    return (
      <Chip
        label={rowData.familleTag}
        icon={rowData.familleIconTag}
        style={{background: rowData.familleTagIconBgcolor, color: rowData.familleTagIconColor}}
      />
    )
}

