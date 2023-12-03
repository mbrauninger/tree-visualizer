import React, { useEffect, useRef } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { TableContainer } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";
import { Step } from "./BinaryTree";

interface ScrollableTableProps {
  data: Step[];
}

const ScrollableTable: React.FC<ScrollableTableProps> = ({ data }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when new elements are added
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [data]);

  return (
    <TableContainer
      component={Paper}
      style={{
        maxHeight: "200px",
        width: "150px",
        overflowY: "auto",
        marginLeft: "10px",
      }}
      ref={tableRef}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>State</TableCell>
            <TableCell>Node</TableCell>
            {/* Add more table headers as needed */}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((step, index) => (
            <TableRow key={index}>
              <TableCell>{step.state}</TableCell>
              <TableCell>{step.value}</TableCell>
              {/* Add more table cells as needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScrollableTable;
