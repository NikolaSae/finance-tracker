"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface Contract {
  id: number;
  humanitarnaOrganizacija: string;
  ugovor: string;
  datumPocetka: string;
  datumIstekka: string;
  kratkiBroj?: string;
  telefon?: string;
  email?: string;
  pib?: string;
  racun?: string;
  banka?: string;
  mb?: string;
  aneks_1?: string;
}

interface UpdateContractFormProps {
  open: boolean;
  contractId: number;
  onClose: () => void;
  onUpdate: () => void;
}

const getErrorMessage = (code: string): string => {
  const errors: { [key: string]: string } = {
    P2002: "Дупликат података",
    P2025: "Запис није пронађен",
    P2003: "Неважећа релација",
    P2022: "Непостојећа колона",
  };
  return errors[code] || "Непозната грешка";
};

export default function UpdateContractForm({ open, contractId, onClose, onUpdate }: UpdateContractFormProps) {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<Contract>();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  const controllerRef = useRef<AbortController>();

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    isMounted.current = true;

    const fetchContract = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/contract/${contractId}`, {
          signal: controller.signal
        });

        if (!res.ok) throw new Error("Неуспело учитавање уговора");
        const data = await res.json();

        if (isMounted.current) {
          // Ажурирај датуме у формат који HTML input очекује (YYYY-MM-DD)
          const formattedData = {
            ...data,
            datumPocetka: data.datumPocetka ? new Date(data.datumPocetka).toISOString().split('T')[0] : '',
            datumIstekka: data.datumIstekka ? new Date(data.datumIstekka).toISOString().split('T')[0] : '',
          };
          
          Object.entries(formattedData).forEach(([key, value]) => {
            setValue(key as keyof Contract, value);
          });
        }
      } catch (error) {
        if (!controller.signal.aborted && isMounted.current) {
          toast.error("Грешка при учитавању података");
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    if (open && contractId) fetchContract();

    return () => {
      isMounted.current = false;
      controller.abort();
      reset(); // Ресетуј форму при затварању
    };
  }, [contractId, setValue, open, reset]);

  const onSubmit = async (updatedData: Contract) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    
    try {
      setLoading(true);
      
      // Форматирај датуме за API
      const formattedData = {
        ...updatedData,
        datumPocetka: updatedData.datumPocetka ? new Date(updatedData.datumPocetka).toISOString() : null,
        datumIstekka: updatedData.datumIstekka ? new Date(updatedData.datumIstekka).toISOString() : null,
      };

      const res = await fetch(`/api/contract/${contractId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
        signal: controller.signal
      });

      const data = await res.json();

      if (!res.ok) {
        // Хендлуј специфичне Prisma грешке
        if (data.errorCode) {
          throw new Error(getErrorMessage(data.errorCode));
        }
        throw new Error(data.message || "Ажурирање није успело");
      }

      toast.success("Уговор успешно ажуриран!");
      onUpdate();
      onClose();
    } catch (error) {
      if (!controller.signal.aborted) {
        toast.error(error instanceof Error ? error.message : "Грешка при ажурирању");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <div className="flex justify-between items-center">
          <span>Ажурирање уговора</span>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {/* Лева колона */}
            <div className="space-y-4">
              <TextField
                {...register("humanitarnaOrganizacija", { required: "Ово поље је обавезно" })}
                label="Назив организације*"
                fullWidth
                error={!!errors.humanitarnaOrganizacija}
                helperText={errors.humanitarnaOrganizacija?.message}
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("ugovor", { required: "Ово поље је обавезно" })}
                label="Број уговора*"
                fullWidth
                error={!!errors.ugovor}
                helperText={errors.ugovor?.message}
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("aneks_1")}
                label="Анекс 1"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("datumPocetka", { required: "Ово поље је обавезно" })}
                label="Почетак важења*"
                type="date"
                fullWidth
                error={!!errors.datumPocetka}
                helperText={errors.datumPocetka?.message}
                InputLabelProps={{ shrink: true }}
                InputProps={{ inputProps: { max: '2100-12-31' } }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("datumIstekka", { required: "Ово поље је обавезно" })}
                label="Истек важења*"
                type="date"
                fullWidth
                error={!!errors.datumIstekka}
                helperText={errors.datumIstekka?.message}
                InputLabelProps={{ shrink: true }}
                InputProps={{ inputProps: { min: new Date().toISOString().split('T')[0] } }}
                sx={{ margin: '8px 0' }}
              />
            </div>

            {/* Десна колона */}
            <div className="space-y-4">
              <TextField
                {...register("kratkiBroj")}
                label="Кратки број"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("telefon")}
                label="Телефон"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("email")}
                label="Имејл"
                type="email"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("pib")}
                label="ПИБ"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("racun")}
                label="Рачун"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("banka")}
                label="Банка"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />

              <TextField
                {...register("mb")}
                label="МБ"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ margin: '8px 0' }}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="secondary" disabled={loading}>
            Откажи
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={loading}>
            {loading ? (
              <div className="flex items-center">
                <CircularProgress size={20} className="mr-2" />
                Чување...
              </div>
            ) : (
              "Сачувај измене"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}